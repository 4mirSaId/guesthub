'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import io from 'socket.io-client';
import { getSocketBase } from '@/lib/socketBase';
import { socketClientOptions } from '@/lib/socketClientOptions';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const AnimationProgramEditor = dynamic(
  () => import('@/components/AnimationProgramEditor'),
  {
    ssr: false,
    loading: () => <p className="text-slate-400 py-8">Loading editor…</p>,
  }
);

export default function AnimationDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [authState, setAuthState] = useState('checking');
  const [dataReady, setDataReady] = useState(false);
  const [animationUsername, setAnimationUsername] = useState('');
  const [activeTab, setActiveTab] = useState('requests');
  const [settings, setSettings] = useState({
    partyName: '',
    dailyDressThemeName: '',
    currentWeek: 'A',
    theme: {
      bgColor: '#ffffff',
      accentColor: '#10b981',
      textColor: '#1f2937',
      cardBgColor: '#ffffff'
    }
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [apiUnreachable, setApiUnreachable] = useState(false);
  const offlineRef = useRef(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({
    requests: 0,
  });
  const activeTabRef = useRef(activeTab);

  usePushNotifications({
    enabled: authState === 'authed',
    role: 'animation',
    tokenKey: 'animationToken',
  });

  const switchTab = (tab) => {
    activeTabRef.current = tab;
    setActiveTab(tab);

    if (tab === 'requests') {
      setUnreadCounts((prev) => ({ ...prev, requests: 0 }));
    }
  };

  const addNotification = useCallback((type, title, description, tab) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setNotifications((prev) => [
      {
        id,
        type,
        title,
        description,
        tab,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 8));

    if (activeTabRef.current !== tab) {
      setUnreadCounts((prev) => ({
        ...prev,
        [tab]: (prev[tab] || 0) + 1,
      }));
    }

    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, 8000);
  }, []);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const openNotification = (notification) => {
    switchTab(notification.tab);
    dismissNotification(notification.id);
  };

  useEffect(() => {
    let active = true;

    const clearSession = () => {
      localStorage.removeItem('animationToken');
      localStorage.removeItem('animationUsername');
    };

    const verifyAuth = async () => {
      let token = localStorage.getItem('animationToken');
      let username = localStorage.getItem('animationUsername');

      if (!token && localStorage.getItem('adminToken')) {
        token = localStorage.getItem('adminToken');
        username = localStorage.getItem('adminUsername') || username;
        localStorage.setItem('animationToken', token);
        if (username) localStorage.setItem('animationUsername', username);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
      }

      if (!token || !username) {
        if (active) {
          setAuthState('guest');
          router.replace('/admin/animation/login');
        }
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!active) return;

        if (!response.ok) {
          clearSession();
          setAuthState('guest');
          router.replace('/admin/animation/login');
          return;
        }

        const authData = await response.json();

        if (authData.role === 'guestrelation') {
          router.replace('/admin/guestrelation');
          return;
        }

        if (authData.role !== 'animation') {
          clearSession();
          setAuthState('guest');
          router.replace('/admin/animation/login');
          return;
        }

        setAnimationUsername(authData.username || username);
        setAuthState('authed');
      } catch (error) {
        if (!active) return;

        const isNetwork =
          error?.name === 'AbortError' ||
          error instanceof TypeError ||
          (typeof error?.message === 'string' && error.message.includes('fetch'));

        if (isNetwork) {
          offlineRef.current = true;
          setAnimationUsername(username);
          setApiUnreachable(true);
          setAuthState('offline');
          return;
        }

        clearSession();
        setAuthState('guest');
        router.replace('/admin/animation/login');
      }
    };

    verifyAuth();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (authState !== 'authed' && authState !== 'offline') return;

    let active = true;

    const loadData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const token = localStorage.getItem('animationToken');
        const [requestsRes, settingsRes, eventsRes] = await Promise.all([
          fetch('/api/requests', {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/settings', {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/events', {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${token}` }
          }),
        ]);

        clearTimeout(timeoutId);

        if (!requestsRes.ok || !settingsRes.ok || !eventsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const requestsData = await requestsRes.json();
        const settingsData = await settingsRes.json();
        const eventsData = await eventsRes.json();

        if (active) {
          setRequests(requestsData);
          setSettings(settingsData);
          setEvents(eventsData.filter((event, index, self) => self.findIndex(e => e._id === event._id) === index));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        if (error.name === 'AbortError') {
          console.error('Request timed out - backend may be down');
        }
      } finally {
        if (active) setDataReady(true);
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

      socket = io(socketBase, {
        ...socketClientOptions,
        forceNew: true,
      });

      socket.on('connect_error', () => {
        /* Expected when API is not running; avoid console spam */
      });

      socket.on('new-request', (newRequest) => {
        if (active) {
          setRequests(prev => [newRequest, ...prev]);
          addNotification(
            'request',
            'New song request',
            newRequest.artist ? `${newRequest.song} by ${newRequest.artist}` : newRequest.song,
            'requests'
          );
        }
      });

      socket.on('update-request', (updatedRequest) => {
        if (active) {
          setRequests(prev =>
            prev.map(req => req._id === updatedRequest._id ? updatedRequest : req)
          );
        }
      });

      socket.on('settings-updated', (updatedSettings) => {
        if (active) setSettings(updatedSettings);
      });

      socket.on('new-event', (newEvent) => {
        if (active) {
          setEvents(prev => {
            // Check if event already exists to prevent duplicates
            if (prev.some(event => event._id === newEvent._id)) {
              return prev;
            }
            return [newEvent, ...prev];
          });
        }
      });

      socket.on('update-event', (updatedEvent) => {
        if (active) {
          setEvents(prev =>
            prev.map(event => event._id === updatedEvent._id ? updatedEvent : event)
          );
        }
      });

      socket.on('delete-event', (deletedEventId) => {
        if (active) {
          setEvents(prev => prev.filter(event => event._id !== deletedEventId));
        }
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }

    return () => {
      active = false;
      if (socket) {
        socket.off('new-request');
        socket.off('update-request');
        socket.off('settings-updated');
        socket.off('new-event');
        socket.off('update-event');
        socket.off('delete-event');
        socket.disconnect();
      }
    };
  }, [authState, router, addNotification]);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedRequest = await response.json();
        setRequests(prev =>
          prev.map(req => req._id === id ? updatedRequest : req)
        );
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('animationToken')}`
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents(prev => {
          // Check if event already exists to prevent duplicates
          if (prev.some(event => event._id === newEvent._id)) {
            return prev;
          }
          return [newEvent, ...prev];
        });
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const updateEvent = async (id, eventData) => {
    try {
      const response = await fetch(`http://localhost:3001/api/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('animationToken')}`
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(prev =>
          prev.map(event => event._id === id ? updatedEvent : event)
        );
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const deleteEvent = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('animationToken')}`
        }
      });

      if (response.ok) {
        setEvents(prev => prev.filter(event => event._id !== id));
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    setSettingsMessage('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSettingsMessage('Settings saved successfully!');
        setTimeout(() => setSettingsMessage(''), 3000);
      } else {
        setSettingsMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSettingsMessage('Network error');
    } finally {
      setSettingsSaving(false);
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
    localStorage.removeItem('animationToken');
    localStorage.removeItem('animationUsername');
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    router.push('/admin');
  };

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
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-emerald-900/30"
        >
          Retry
        </button>
      </div>
    );
  }

  if (authState === 'checking' || authState === 'guest') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-xl text-slate-400">
          {authState === 'guest' ? 'Redirecting to login…' : 'Loading…'}
        </p>
      </div>
    );
  }

  if (!dataReady && !apiUnreachable) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-xl text-slate-400">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 p-8 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-emerald-500">
              Animation Dashboard
            </h1>
            <p className="text-slate-400 text-lg mt-2">Logged in as: <span className="text-emerald-400 font-semibold">{animationUsername}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
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
                    <p className="mt-2 text-xs font-medium text-emerald-400">Open {notification.tab}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissNotification(notification.id)}
                    className="rounded-lg px-2 py-1 text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-white"
                    aria-label="Dismiss notification"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-12 border-b border-slate-800 pb-4">
          <button
            onClick={() => switchTab('requests')}
            className={`px-8 py-4 font-semibold text-lg rounded-xl transition-all duration-300 ease-in-out ${
              activeTab === 'requests'
                ? `bg-emerald-500 text-white shadow-md`
                : 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
            style={{
              backgroundColor: activeTab === 'requests' ? '#10b981' : 'transparent',
              color: activeTab === 'requests' ? 'white' : 'inherit'
            }}
          >
            Song Requests
            {renderUnreadBadge('requests')}
          </button>
          <button
            onClick={() => switchTab('activities')}
            className={`px-6 py-4 font-semibold text-base sm:text-lg rounded-xl transition-all duration-300 ease-in-out ${
              activeTab === 'activities'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Activities
          </button>
          <button
            onClick={() => switchTab('nightShows')}
            className={`px-6 py-4 font-semibold text-base sm:text-lg rounded-xl transition-all duration-300 ease-in-out ${
              activeTab === 'nightShows'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Night Shows
          </button>
          <button
            onClick={() => switchTab('kidsClub')}
            className={`px-6 py-4 font-semibold text-base sm:text-lg rounded-xl transition-all duration-300 ease-in-out ${
              activeTab === 'kidsClub'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            Kids Club
          </button>
          <button
            onClick={() => switchTab('events')}
            className={`px-8 py-4 font-semibold text-lg rounded-xl transition-all duration-300 ease-in-out ${
              activeTab === 'events'
                ? `bg-emerald-500 text-white shadow-md`
                : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
            }`}
            style={{
              backgroundColor: activeTab === 'events' ? '#10b981' : 'transparent',
              color: activeTab === 'events' ? 'white' : 'inherit'
            }}
          >
            Special Events
          </button>
        </div>

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-4xl font-bold mb-10 text-white">Song Requests</h2>
            <div className="space-y-8">
              {requests.length === 0 ? (
                <div className="text-center text-slate-400 text-xl py-16 rounded-2xl border border-slate-800 bg-slate-900/60">No song requests yet.</div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request._id}
                    className="p-8 rounded-2xl shadow-xl shadow-black/20 hover:shadow-black/40 border border-slate-800 transition-all duration-300 ease-in-out bg-slate-900"
                    style={{
                      borderColor: request.status === 'pending' ? '#10b981' : 'transparent'
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-white">{request.song}</h3>
                        {request.artist && (
                          <p className="text-slate-400 text-lg">by {request.artist}</p>
                        )}
                        <p className="text-sm text-slate-500 mt-2">
                          {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span 
                          className="px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                          style={{ 
                            backgroundColor: getStatusColor(request.status),
                            color: 'white'
                          }}
                        >
                          {request.status}
                        </span>
                        {request.status === 'pending' && (
                          <div className="flex space-x-4">
                            <button
                              onClick={() => updateStatus(request._id, 'accepted')}
                              className="px-6 py-3 rounded-xl transition-all duration-300 ease-in-out text-white font-medium shadow-md hover:shadow-lg bg-green-500 hover:bg-green-600"
                              style={{ backgroundColor: '#16a34a' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateStatus(request._id, 'rejected')}
                              className="px-6 py-3 rounded-xl transition-all duration-300 ease-in-out text-white font-medium shadow-md hover:shadow-lg bg-red-500 hover:bg-red-600"
                              style={{ backgroundColor: '#dc2626' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'activities' && <AnimationProgramEditor section="activities" />}
        {activeTab === 'nightShows' && <AnimationProgramEditor section="nightShows" settings={settings} onSettingsChange={setSettings} onSaveSettings={saveSettings} />}
        {activeTab === 'kidsClub' && <AnimationProgramEditor section="kidsClub" />}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <h2 className="text-4xl font-bold mb-12 text-white">Special Events</h2>
            <div className="space-y-8 max-w-4xl">
              {/* Add New Event Form */}
              <div className="p-8 rounded-2xl shadow-xl shadow-black/20 bg-slate-900 border border-slate-800">
                <h3 className="text-2xl font-bold mb-6 text-white">Add New Event</h3>
                <EventForm onSubmit={createEvent} />
              </div>

              {/* Events List */}
              <div className="space-y-6">
                {events.length === 0 ? (
                  <div className="text-center text-slate-400 text-xl py-16 bg-slate-900 rounded-2xl shadow-xl shadow-black/20 border border-slate-800">
                    No special events yet.
                  </div>
                ) : (
                  events.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      onUpdate={updateEvent}
                      onDelete={deleteEvent}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

// Event Form Component
function EventForm({ onSubmit, initialData = {}, onCancel }) {
  const [formData, setFormData] = useState({
    eventName: initialData.eventName || '',
    time: initialData.time || '',
    location: initialData.location || '',
    moreInfo: initialData.moreInfo || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onSubmit(formData);
    setLoading(false);

    if (result.success) {
      setFormData({ eventName: '', time: '', location: '', moreInfo: '' });
      if (onCancel) onCancel();
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold mb-3 text-white">Event Name *</label>
          <input
            type="text"
            value={formData.eventName}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            className="w-full px-6 py-4 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg transition-all duration-300 ease-in-out"
            placeholder="e.g., Beach Volleyball Tournament"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-semibold mb-3 text-white">Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-6 py-4 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg transition-all duration-300 ease-in-out"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-lg font-semibold mb-3 text-white">Location *</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-6 py-4 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg transition-all duration-300 ease-in-out"
          placeholder="e.g., Main Beach Area"
          required
        />
      </div>
      <div>
        <label className="block text-lg font-semibold mb-3 text-white">More Info</label>
        <textarea
          value={formData.moreInfo}
          onChange={(e) => setFormData({ ...formData, moreInfo: e.target.value })}
          className="w-full px-6 py-4 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg transition-all duration-300 ease-in-out resize-vertical"
          placeholder="Additional details about the event..."
          rows={3}
        />
      </div>
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 px-6 py-4 rounded-xl text-lg shadow-sm">
          {error}
        </div>
      )}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600"
        >
          {loading ? 'Saving...' : (initialData._id ? 'Update Event' : 'Add Event')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 rounded-xl font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all duration-300 ease-in-out"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// Event Card Component
function EventCard({ event, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setDeleting(true);
      await onDelete(event._id);
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 rounded-2xl shadow-xl shadow-black/20 bg-slate-900 border border-slate-800 hover:shadow-black/40 transition-all duration-300 ease-in-out">
      {editing ? (
        <div>
          <h3 className="text-2xl font-bold mb-6 text-white">Edit Event</h3>
          <EventForm
            onSubmit={async (data) => {
              const result = await onUpdate(event._id, data);
              if (result.success) setEditing(false);
              return result;
            }}
            initialData={event}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">{event.eventName}</h3>
              <div className="space-y-2 text-slate-300">
                <p className="flex items-center">
                  <span className="font-semibold text-emerald-500 mr-2">Time:</span>
                  {event.time}
                </p>
                <p className="flex items-center">
                  <span className="font-semibold text-emerald-500 mr-2">Location:</span>
                  {event.location}
                </p>
                {event.moreInfo && (
                  <p className="flex items-start">
                    <span className="font-semibold text-emerald-500 mr-2">Info:</span>
                    <span className="whitespace-pre-line">{event.moreInfo}</span>
                  </p>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Created: {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 ml-6">
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-3 rounded-xl transition-all duration-300 ease-in-out text-white font-medium shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 rounded-xl transition-all duration-300 ease-in-out text-white font-medium shadow-md hover:shadow-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-600"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
