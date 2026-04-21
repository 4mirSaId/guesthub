'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';

export default function AdminPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
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

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      // Check if token exists in localStorage
      const token = localStorage.getItem('adminToken');
      const username = localStorage.getItem('adminUsername');

      if (!token || !username) {
        // Redirect to login
        router.push('/admin/login');
        return;
      }

      // Verify token with backend
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('http://localhost:3001/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUsername');
          router.push('/admin/login');
          return;
        }

        if (active) {
          setAuthenticated(true);
          setAdminUsername(username);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        // If backend is unreachable, redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        router.push('/admin/login');
      }
    };

    checkAuth();

    // Fallback: if still loading after 10 seconds, redirect to login
    const fallbackTimeout = setTimeout(() => {
      if (active && !authenticated) {
        console.error('Loading timeout - redirecting to login');
        router.push('/admin/login');
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
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const [requestsRes, complaintsRes, settingsRes, eventsRes] = await Promise.all([
          fetch('http://localhost:3001/api/requests', {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
          }),
          fetch('http://localhost:3001/api/complaints', {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
          }),
          fetch('http://localhost:3001/api/settings', {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
          }),
          fetch('http://localhost:3001/api/events', {
            signal: controller.signal,
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
          })
        ]);

        clearTimeout(timeoutId);

        if (!requestsRes.ok || !complaintsRes.ok || !settingsRes.ok || !eventsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const requestsData = await requestsRes.json();
        const complaintsData = await complaintsRes.json();
        const settingsData = await settingsRes.json();
        const eventsData = await eventsRes.json();

        if (active) {
          setRequests(requestsData);
          setComplaints(complaintsData);
          setSettings(settingsData);
          setEvents(eventsData.filter((event, index, self) => self.findIndex(e => e._id === event._id) === index));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        if (error.name === 'AbortError') {
          console.error('Request timed out - backend may be down');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    let socket;
    try {
      socket = io('http://localhost:3001', {
        timeout: 5000,
        forceNew: true
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection failed:', error);
      });

      socket.on('new-request', (newRequest) => {
        if (active) setRequests(prev => [newRequest, ...prev]);
      });

      socket.on('update-request', (updatedRequest) => {
        if (active) {
          setRequests(prev =>
            prev.map(req => req._id === updatedRequest._id ? updatedRequest : req)
          );
        }
      });

      socket.on('new-complaint', (newComplaint) => {
        if (active) setComplaints(prev => [newComplaint, ...prev]);
      });

      socket.on('update-complaint', (updatedComplaint) => {
        if (active) {
          setComplaints(prev =>
            prev.map(complaint => complaint._id === updatedComplaint._id ? updatedComplaint : complaint)
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
  }, [authenticated]);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:3001/api/requests/${id}`, {
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

  const updateComplaintStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:3001/api/complaints/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedComplaint = await response.json();
        setComplaints(prev =>
          prev.map(complaint => complaint._id === id ? updatedComplaint : complaint)
        );
      }
    } catch (error) {
      console.error('Failed to update complaint status:', error);
    }
  };

  const createEvent = async (eventData) => {
    try {
      const response = await fetch('http://localhost:3001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
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
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
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
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
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
      const response = await fetch('http://localhost:3001/api/settings', {
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

  const handleLogout = async () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    
    try {
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    router.push('/admin/login');
  };

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 text-gray-800 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800 p-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-emerald-500">
              DJ Admin Control Center
            </h1>
            <p className="text-gray-500 text-lg mt-2">Logged in as: <span className="text-emerald-500 font-semibold">{adminUsername}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-12 border-b border-gray-100 pb-4">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-8 py-4 font-semibold text-lg rounded-xl transition-all duration-300 ease-in-out ${
              activeTab === 'requests'
                ? `bg-emerald-500 text-white shadow-md`
                : 'bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
            style={{
              backgroundColor: activeTab === 'requests' ? '#10b981' : 'white',
              color: activeTab === 'requests' ? 'white' : 'inherit'
            }}
          >
            Song Requests
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-8 py-4 font-semibold text-lg rounded-xl transition-all duration-300 ease-in-out ${
              activeTab === 'complaints'
                ? `bg-emerald-500 text-white shadow-md`
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
            style={{
              backgroundColor: activeTab === 'complaints' ? '#10b981' : 'transparent',
              color: activeTab === 'complaints' ? 'white' : 'inherit'
            }}
          >
            Complaints
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-8 py-4 font-semibold text-lg rounded-xl transition-all duration-300 ease-in-out ${
              activeTab === 'events'
                ? `bg-emerald-500 text-white shadow-md`
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
            style={{
              backgroundColor: activeTab === 'events' ? '#10b981' : 'transparent',
              color: activeTab === 'events' ? 'white' : 'inherit'
            }}
          >
            Special Events
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-8 py-4 font-semibold text-lg rounded-xl transition-all duration-300 ease-in-out ${
              activeTab === 'settings'
                ? `bg-emerald-500 text-white shadow-md`
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
            style={{
              backgroundColor: activeTab === 'settings' ? '#10b981' : 'transparent',
              color: activeTab === 'settings' ? 'white' : 'inherit'
            }}
          >
            Party Settings
          </button>
        </div>

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-4xl font-bold mb-10 text-gray-800">Song Requests</h2>
            <div className="space-y-8">
              {requests.length === 0 ? (
                <div className="text-center text-gray-500 text-xl py-16">No song requests yet.</div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request._id}
                    className="p-8 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 ease-in-out bg-white"
                    style={{
                      borderColor: request.status === 'pending' ? '#10b981' : 'transparent'
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-gray-800">{request.song}</h3>
                        {request.artist && (
                          <p className="text-gray-500 text-lg">by {request.artist}</p>
                        )}
                        <p className="text-sm text-gray-400 mt-2">
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

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div>
            <h2 className="text-4xl font-bold mb-10 text-gray-800">Customer Complaints</h2>
            <div className="space-y-8">
              {complaints.length === 0 ? (
                <div className="text-center text-gray-500 text-xl py-16">No complaints submitted yet.</div>
              ) : (
                complaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    className="p-8 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 ease-in-out bg-white"
                    style={{
                      borderColor: complaint.status === 'pending' ? '#10b981' : 'transparent'
                    }}
                  >
                    <div className="flex justify-between items-start gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-gray-800">{complaint.fullName}</h3>
                        <p className="text-gray-500 text-lg">Room {complaint.roomNumber}</p>
                        <p className="text-gray-700 text-base mt-4 whitespace-pre-line">{complaint.complaintText}</p>
                        <p className="text-sm text-gray-400 mt-4">{new Date(complaint.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-4">
                        <span
                          className="px-4 py-2 rounded-xl text-sm font-medium shadow-sm"
                          style={{
                            backgroundColor: getStatusColor(complaint.status),
                            color: 'white'
                          }}
                        >
                          {complaint.status}
                        </span>
                        {complaint.status === 'pending' && (
                          <button
                            onClick={() => updateComplaintStatus(complaint._id, 'reviewed')}
                            className="px-6 py-3 rounded-xl transition-all duration-300 ease-in-out text-white font-medium shadow-md hover:shadow-lg bg-blue-500 hover:bg-blue-600"
                            style={{ backgroundColor: '#3b82f6' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
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

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <h2 className="text-4xl font-bold mb-12 text-gray-800">Special Events</h2>
            <div className="space-y-8 max-w-4xl">
              {/* Add New Event Form */}
              <div className="p-8 rounded-2xl shadow-md bg-white border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Add New Event</h3>
                <EventForm onSubmit={createEvent} />
              </div>

              {/* Events List */}
              <div className="space-y-6">
                {events.length === 0 ? (
                  <div className="text-center text-gray-500 text-xl py-16 bg-white rounded-2xl shadow-md border border-gray-100">
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-4xl font-bold mb-12 text-gray-800">Party Settings</h2>
            <div className="space-y-8 max-w-4xl">
              {/* Party Name */}
              <div
                className="p-8 rounded-2xl shadow-md bg-white border border-gray-100"
              >
                <label className="block text-lg font-semibold mb-4 text-gray-800">Party Name</label>
                <input
                  type="text"
                  value={settings.partyName || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    partyName: e.target.value
                  })}
                  className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-lg transition-all duration-300 ease-in-out"
                  style={{
                    borderColor: '#10b981',
                    borderWidth: '2px'
                  }}
                  placeholder="Enter party name (e.g., Night Party 2026)"
                />
              </div>

              {/* Daily Dress Theme Name */}
              <div
                className="p-8 rounded-2xl shadow-md bg-white border border-gray-100"
              >
                <label className="block text-lg font-semibold mb-4 text-gray-800">Daily Dress Theme Name</label>
                <input
                  type="text"
                  value={settings.dailyDressThemeName || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    dailyDressThemeName: e.target.value
                  })}
                  className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-lg transition-all duration-300 ease-in-out"
                  style={{
                    borderColor: '#10b981',
                    borderWidth: '2px'
                  }}
                  placeholder="Enter dress theme (e.g., Beach Casual, Tropical Vibes)"
                />
              </div>

              {/* Current Week */}
              <div
                className="p-8 rounded-2xl shadow-md bg-white border border-gray-100"
              >
                <label className="block text-lg font-semibold mb-4 text-gray-800">Current Week for Tonight&apos;s Show</label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="currentWeek"
                      value="A"
                      checked={settings.currentWeek === 'A'}
                      onChange={(e) => setSettings({
                        ...settings,
                        currentWeek: e.target.value
                      })}
                      className="mr-3"
                    />
                    <span className="text-lg">Week A</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="currentWeek"
                      value="B"
                      checked={settings.currentWeek === 'B'}
                      onChange={(e) => setSettings({
                        ...settings,
                        currentWeek: e.target.value
                      })}
                      className="mr-3"
                    />
                    <span className="text-lg">Week B</span>
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">Switch between Week A and Week B programs for the nightly entertainment schedule.</p>
              </div>

              {/* Save Button */}
              <button
                onClick={saveSettings}
                disabled={settingsSaving}
                className="w-full px-8 py-4 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out bg-emerald-500 hover:bg-emerald-600"
                style={{
                  backgroundColor: '#10b981',
                  opacity: settingsSaving ? 0.6 : 1
                }}
              >
                {settingsSaving ? 'Saving...' : 'Save Settings'}
              </button>

              {settingsMessage && (
                <p className="text-center font-semibold text-lg">{settingsMessage}</p>
              )}
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
          <label className="block text-lg font-semibold mb-3 text-gray-800">Event Name *</label>
          <input
            type="text"
            value={formData.eventName}
            onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
            className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-lg transition-all duration-300 ease-in-out"
            placeholder="e.g., Beach Volleyball Tournament"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-semibold mb-3 text-gray-800">Time *</label>
          <input
            type="text"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-lg transition-all duration-300 ease-in-out"
            placeholder="e.g., 2:00 PM - 5:00 PM"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-lg font-semibold mb-3 text-gray-800">Location *</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-lg transition-all duration-300 ease-in-out"
          placeholder="e.g., Main Beach Area"
          required
        />
      </div>
      <div>
        <label className="block text-lg font-semibold mb-3 text-gray-800">More Info</label>
        <textarea
          value={formData.moreInfo}
          onChange={(e) => setFormData({ ...formData, moreInfo: e.target.value })}
          className="w-full px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-lg transition-all duration-300 ease-in-out resize-vertical"
          placeholder="Additional details about the event..."
          rows={3}
        />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-lg shadow-sm">
          {error}
        </div>
      )}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : (initialData._id ? 'Update Event' : 'Add Event')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300 ease-in-out"
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
    <div className="p-8 rounded-2xl shadow-md bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 ease-in-out">
      {editing ? (
        <div>
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Edit Event</h3>
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
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{event.eventName}</h3>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center">
                  <span className="font-semibold mr-2">🕒</span>
                  {event.time}
                </p>
                <p className="flex items-center">
                  <span className="font-semibold mr-2">📍</span>
                  {event.location}
                </p>
                {event.moreInfo && (
                  <p className="flex items-start">
                    <span className="font-semibold mr-2">ℹ️</span>
                    <span className="whitespace-pre-line">{event.moreInfo}</span>
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Created: {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 ml-6">
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-3 rounded-xl transition-all duration-300 ease-in-out text-white font-medium shadow-md hover:shadow-lg bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-6 py-3 rounded-xl transition-all duration-300 ease-in-out text-white font-medium shadow-md hover:shadow-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-400"
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
