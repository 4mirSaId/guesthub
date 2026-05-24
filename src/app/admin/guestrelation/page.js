'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { getSocketBase } from '@/lib/socketBase';
import { socketClientOptions } from '@/lib/socketClientOptions';
import AnnouncementManager from '@/components/AnnouncementManager';

export default function GuestRelationDashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [staffUsername, setStaffUsername] = useState('');
  const [activeTab, setActiveTab] = useState('services');
  const [apiUnreachable, setApiUnreachable] = useState(false);
  const offlineRef = useRef(false);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [serviceUpdating, setServiceUpdating] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({
    complaints: 0,
    services: 0,
    feedback: 0,
  });
  const activeTabRef = useRef(activeTab);

  const feedbackStats = useMemo(() => {
    const total = feedbackItems.length;
    if (total === 0) return { total: 0, average: null };
    const sum = feedbackItems.reduce((acc, f) => acc + (Number(f.rating) || 0), 0);
    return { total, average: Math.round((sum / total) * 10) / 10 };
  }, [feedbackItems]);

  const switchTab = (tab) => {
    activeTabRef.current = tab;
    setActiveTab(tab);
    if (['complaints', 'services', 'feedback'].includes(tab)) {
      setUnreadCounts((prev) => ({ ...prev, [tab]: 0 }));
    }
  };

  const addNotification = useCallback((type, title, description, tab) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setNotifications((prev) => [
      { id, type, title, description, tab, createdAt: new Date().toISOString() },
      ...prev,
    ].slice(0, 8));

    if (activeTabRef.current !== tab) {
      setUnreadCounts((prev) => ({ ...prev, [tab]: (prev[tab] || 0) + 1 }));
    }

    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 8000);
  }, []);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const openNotification = (notification) => {
    switchTab(notification.tab);
    dismissNotification(notification.id);
  };

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      const token = localStorage.getItem('grToken');
      const username = localStorage.getItem('grUsername');

      if (!token || !username) {
        router.push('/admin/guestrelation/login');
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          localStorage.removeItem('grToken');
          localStorage.removeItem('grUsername');
          router.push('/admin/guestrelation/login');
          return;
        }

        const data = await response.json();
        if (data.role === 'animation') {
          router.push('/admin/animation');
          return;
        }
        if (data.role !== 'guestrelation') {
          localStorage.removeItem('grToken');
          localStorage.removeItem('grUsername');
          router.push('/admin/guestrelation/login');
          return;
        }

        if (active) {
          setAuthenticated(true);
          setStaffUsername(data.username || username);
        }
      } catch (error) {
        const isAbort = error?.name === 'AbortError';
        const isNetwork =
          isAbort ||
          error instanceof TypeError ||
          (typeof error?.message === 'string' && error.message.includes('fetch'));

        if (isNetwork) {
          offlineRef.current = true;
          if (active) {
            setApiUnreachable(true);
            setLoading(false);
          }
          return;
        }

        localStorage.removeItem('grToken');
        localStorage.removeItem('grUsername');
        router.push('/admin/guestrelation/login');
      }
    };

    checkAuth();

    const fallbackTimeout = setTimeout(() => {
      if (active && !authenticated && !offlineRef.current) {
        setLoading(false);
        router.push('/admin/guestrelation/login');
      }
    }, 10000);

    return () => {
      active = false;
      clearTimeout(fallbackTimeout);
    };
  }, [router, authenticated]);

  useEffect(() => {
    if (!authenticated) return;

    let active = true;

    const loadData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const token = localStorage.getItem('grToken');

        const [complaintsRes, servicesRes, feedbackRes] = await Promise.all([
          fetch('/api/complaints', { signal: controller.signal }),
          fetch('/api/service-requests', { signal: controller.signal }),
          fetch('/api/feedback', {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        clearTimeout(timeoutId);

        if (!feedbackRes.ok && feedbackRes.status === 401) {
          localStorage.removeItem('grToken');
          localStorage.removeItem('grUsername');
          router.push('/admin/guestrelation/login');
          return;
        }

        const complaintsData = complaintsRes.ok ? await complaintsRes.json() : [];
        const servicesData = servicesRes.ok ? await servicesRes.json() : [];
        const feedbackData = feedbackRes.ok ? await feedbackRes.json() : [];

        if (active) {
          setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
          setServiceRequests(Array.isArray(servicesData) ? servicesData : []);
          setFeedbackItems(Array.isArray(feedbackData) ? feedbackData : []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    let socket;
    try {
      const socketBase = getSocketBase();
      if (!socketBase) {
        return () => {
          active = false;
        };
      }

      socket = io(socketBase, { ...socketClientOptions, forceNew: true });

      socket.on('new-complaint', (newComplaint) => {
        if (active) {
          setComplaints((prev) => [newComplaint, ...prev]);
          addNotification(
            'complaint',
            'New complaint',
            `Room ${newComplaint.roomNumber} - ${newComplaint.fullName}`,
            'complaints'
          );
        }
      });

      socket.on('update-complaint', (updatedComplaint) => {
        if (active) {
          setComplaints((prev) =>
            prev.map((c) => (c._id === updatedComplaint._id ? updatedComplaint : c))
          );
        }
      });

      socket.on('new-service-request', (newServiceRequest) => {
        if (active) {
          setServiceRequests((prev) => {
            if (prev.some((r) => r._id === newServiceRequest._id)) return prev;
            return [newServiceRequest, ...prev];
          });
          addNotification(
            'service',
            'New service request',
            `Room ${newServiceRequest.room} - ${newServiceRequest.type}`,
            'services'
          );
        }
      });

      socket.on('update-service-request', (updatedServiceRequest) => {
        if (active) {
          setServiceRequests((prev) =>
            prev.map((r) => (r._id === updatedServiceRequest._id ? updatedServiceRequest : r))
          );
        }
      });

      socket.on('new-feedback', (newFeedback) => {
        if (active) {
          setFeedbackItems((prev) => {
            if (prev.some((f) => f._id === newFeedback._id)) return prev;
            return [newFeedback, ...prev];
          });
          addNotification(
            'feedback',
            'New guest feedback',
            `${newFeedback.type} - ${newFeedback.rating}/5`,
            'feedback'
          );
        }
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }

    return () => {
      active = false;
      if (socket) {
        socket.off('new-complaint');
        socket.off('update-complaint');
        socket.off('new-service-request');
        socket.off('update-service-request');
        socket.off('new-feedback');
        socket.disconnect();
      }
    };
  }, [authenticated, router, addNotification]);

  const updateServiceRequestStatus = async (id, status) => {
    setServiceUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`http://localhost:3001/api/service-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const updated = await response.json();
        setServiceRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));
      }
    } catch (error) {
      console.error('Failed to update service request:', error);
    } finally {
      setServiceUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const updateComplaintStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:3001/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const updated = await response.json();
        setComplaints((prev) => prev.map((c) => (c._id === id ? updated : c)));
      }
    } catch (error) {
      console.error('Failed to update complaint status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'accepted': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
      case 'reviewed': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getServiceStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'in-progress': return 'bg-blue-600';
      case 'done': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getServiceTypeIcon = (type) => {
    switch (type) {
      case 'Cleaning': return '🧹';
      case 'Maintenance': return '🔧';
      case 'Food & Drink': return '🍽️';
      default: return '📋';
    }
  };

  const renderUnreadBadge = (tab) => {
    const count = unreadCounts[tab] || 0;
    if (count === 0) return null;
    return (
      <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
        {count}
      </span>
    );
  };

  const handleLogout = async () => {
    localStorage.removeItem('grToken');
    localStorage.removeItem('grUsername');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    router.push('/admin/guestrelation/login');
  };

  const tabClass = (tab) =>
    `px-6 sm:px-8 py-4 font-semibold text-base sm:text-lg rounded-xl transition-all duration-300 ease-in-out ${
      activeTab === tab
        ? 'bg-sky-500 text-white shadow-md'
        : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
    }`;

  if (apiUnreachable) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8 gap-4">
        <div className="text-xl font-semibold text-center text-white">Cannot connect to the API server</div>
        <p className="text-slate-400 text-center max-w-md text-sm">
          The internal API is not responding right now. Reload the app or check the deployment logs.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-xl text-slate-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 p-8 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-sky-400">Guest Relations</h1>
            <p className="text-slate-400 text-lg mt-2">
              Logged in as: <span className="text-sky-300 font-semibold">{staffUsername}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              ← Portal
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="fixed right-4 top-24 z-[70] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
            {notifications.slice(0, 4).map((notification) => (
              <div
                key={notification.id}
                className="rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-black/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => openNotification(notification)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-sm font-bold text-white">{notification.title}</p>
                    <p className="mt-1 truncate text-sm text-slate-400">{notification.description}</p>
                    <p className="mt-2 text-xs font-medium text-sky-400">Open {notification.tab}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissNotification(notification.id)}
                    className="rounded-lg px-2 py-1 text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white"
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 sm:gap-4 mb-12 border-b border-slate-800 pb-4">
          <button type="button" onClick={() => switchTab('services')} className={tabClass('services')}>
            Service Requests
            {renderUnreadBadge('services')}
          </button>
          <button type="button" onClick={() => switchTab('complaints')} className={tabClass('complaints')}>
            Complaints
            {renderUnreadBadge('complaints')}
          </button>
          <button type="button" onClick={() => switchTab('feedback')} className={tabClass('feedback')}>
            Feedback
            {renderUnreadBadge('feedback')}
          </button>
          <button type="button" onClick={() => switchTab('announcements')} className={tabClass('announcements')}>
            Announcements
          </button>
        </div>

        {activeTab === 'services' && (
          <div>
            <h2 className="text-4xl font-bold mb-10 text-white">Service Requests</h2>
            <div className="space-y-8">
              {serviceRequests.length === 0 ? (
                <div className="text-center text-slate-400 text-xl py-16 bg-slate-900/60 rounded-2xl border border-slate-800">
                  No service requests yet.
                </div>
              ) : (
                serviceRequests.map((r) => (
                  <div
                    key={r._id}
                    className="p-8 rounded-2xl shadow-xl shadow-black/20 border border-slate-800 bg-slate-900"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{getServiceTypeIcon(r.type)}</span>
                          <div>
                            <h3 className="text-2xl font-semibold text-white">Room {r.room}</h3>
                            <p className="text-slate-400 text-sm font-medium">{r.type}</p>
                          </div>
                        </div>
                        {r.message && (
                          <p className="text-slate-200 text-base mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800 whitespace-pre-wrap">
                            {r.message}
                          </p>
                        )}
                        <p className="text-sm text-slate-500 mt-4">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                      <div className="flex flex-col items-stretch sm:items-end gap-4 shrink-0">
                        <span
                          className={`px-4 py-2 rounded-xl text-sm font-medium text-white capitalize text-center ${getServiceStatusClass(r.status)}`}
                        >
                          {r.status}
                        </span>
                        <div className="flex flex-wrap gap-3 justify-end">
                          {r.status !== 'done' && (
                            <>
                              {r.status !== 'in-progress' && (
                                <button
                                  type="button"
                                  onClick={() => updateServiceRequestStatus(r._id, 'in-progress')}
                                  disabled={serviceUpdating[r._id]}
                                  className="px-6 py-3 rounded-xl text-white font-medium bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                  {serviceUpdating[r._id] ? 'Updating…' : 'In progress'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => updateServiceRequestStatus(r._id, 'done')}
                                disabled={serviceUpdating[r._id]}
                                className="px-6 py-3 rounded-xl text-white font-medium bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                              >
                                {serviceUpdating[r._id] ? 'Updating…' : 'Mark done'}
                              </button>
                            </>
                          )}
                          {r.status === 'done' && (
                            <span className="px-6 py-3 rounded-xl text-white font-medium bg-gray-500 text-center">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div>
            <h2 className="text-4xl font-bold mb-10 text-white">Customer Complaints</h2>
            <div className="space-y-8">
              {complaints.length === 0 ? (
                <div className="text-center text-slate-400 text-xl py-16 rounded-2xl border border-slate-800 bg-slate-900/60">
                  No complaints submitted yet.
                </div>
              ) : (
                complaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className="p-8 rounded-2xl shadow-xl border border-slate-800 bg-slate-900"
                    style={{ borderColor: complaint.status === 'pending' ? '#38bdf8' : undefined }}
                  >
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-white">{complaint.fullName}</h3>
                        <p className="text-slate-400 text-lg">Room {complaint.roomNumber}</p>
                        <p className="text-slate-200 text-base mt-4 whitespace-pre-line">{complaint.complaintText}</p>
                        <p className="text-sm text-slate-500 mt-4">
                          {new Date(complaint.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-4">
                        <span className={`px-4 py-2 rounded-xl text-sm font-medium text-white ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        {complaint.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => updateComplaintStatus(complaint._id, 'reviewed')}
                            className="px-6 py-3 rounded-xl text-white font-medium bg-blue-500 hover:bg-blue-600"
                          >
                            Mark Reviewed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            <h2 className="text-4xl font-bold mb-6 text-white">Guest Feedback</h2>
            <p className="text-slate-400 mb-10 max-w-2xl">
              All submissions, including low ratings kept private from the public reviews section.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Total feedback</p>
                <p className="text-3xl font-bold text-white mt-2">{feedbackStats.total}</p>
              </div>
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Average rating</p>
                <p className="text-3xl font-bold text-sky-400 mt-2">
                  {feedbackStats.average !== null ? `${feedbackStats.average} / 5` : '—'}
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {feedbackItems.length === 0 ? (
                <div className="text-center text-slate-400 text-xl py-16 bg-slate-900/60 rounded-2xl border border-slate-800">
                  No feedback yet.
                </div>
              ) : (
                feedbackItems.map((fb) => {
                  const low = Number(fb.rating) <= 2;
                  return (
                    <div
                      key={fb._id}
                      className={`p-6 sm:p-8 rounded-2xl border ${
                        low ? 'border-red-900/80 bg-red-950/35' : 'border-slate-800 bg-slate-900'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="inline-flex items-center rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold uppercase text-slate-300">
                            {fb.type}
                          </span>
                          <span className="text-amber-400 text-lg" aria-label={`${fb.rating} of 5 stars`}>
                            {'★'.repeat(Number(fb.rating) || 0)}
                            <span className="text-slate-600">{'★'.repeat(5 - (Number(fb.rating) || 0))}</span>
                          </span>
                          {!fb.isPublic && (
                            <span className="text-xs font-medium text-slate-500 border border-slate-700 rounded-lg px-2 py-0.5">
                              Staff only
                            </span>
                          )}
                        </div>
                        <time className="text-sm text-slate-500 shrink-0" dateTime={fb.createdAt}>
                          {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : '—'}
                        </time>
                      </div>
                      <p className={`text-sm sm:text-base whitespace-pre-wrap ${low ? 'text-red-100/95' : 'text-slate-300'}`}>
                        {fb.comment?.trim() ? fb.comment : <span className="text-slate-600 italic">No comment</span>}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && <AnnouncementManager embedded />}
      </div>
    </div>
  );
}
