'use client';

import { useState, useEffect } from 'react';
import { getApiBase } from '@/lib/apiBase';

export default function AnnouncementsAdmin() {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('warning');
  const [icon, setIcon] = useState('⚠️');
  const [autoHideSeconds, setAutoHideSeconds] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch all announcements on mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${getApiBase()}/api/announcement/all`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setError('Failed to fetch announcements');
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    setLoading(true);

    try {
      const base = getApiBase();
      const url = editingId
        ? `${base}/api/announcement/${editingId}`
        : `${base}/api/announcement`;

      const method = editingId ? 'PATCH' : 'POST';

      const payload = {
        message,
        priority,
        icon,
        active: true
      };

      if (autoHideSeconds && !isNaN(autoHideSeconds)) {
        payload.autoHideSeconds = parseInt(autoHideSeconds);
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccessMessage(
          editingId
            ? '✅ Announcement updated and published!'
            : '✅ Announcement published successfully!'
        );
        setMessage('');
        setAutoHideSeconds('');
        setPriority('warning');
        setIcon('⚠️');
        setEditingId(null);
        await fetchAnnouncements();

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error publishing announcement:', error);
      setError('Failed to publish announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${getApiBase()}/api/announcement/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccessMessage('✅ Announcement deleted!');
        await fetchAnnouncements();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError('Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setMessage(announcement.message);
    setPriority(announcement.priority);
    setIcon(announcement.icon);
    setAutoHideSeconds(announcement.autoHideSeconds ? announcement.autoHideSeconds.toString() : '');
    setEditingId(announcement._id);
  };

  const handleCancel = () => {
    setMessage('');
    setAutoHideSeconds('');
    setPriority('warning');
    setIcon('⚠️');
    setEditingId(null);
  };

  const iconOptions = ['⚠️', '🔴', '❌', 'ℹ️', '🔔', '📢', '💡', '🎯'];
  const priorityColors = {
    danger: 'border-red-900/70 bg-red-950/35',
    warning: 'border-amber-900/70 bg-amber-950/25',
    info: 'border-sky-900/70 bg-sky-950/25'
  };
  const priorityBadgeColors = {
    danger: 'bg-red-950/60 text-red-200 border border-red-900/60',
    warning: 'bg-amber-950/40 text-amber-200 border border-amber-900/60',
    info: 'bg-sky-950/40 text-sky-200 border border-sky-900/60'
  };

  const activeAnnouncement = announcements.find((a) => a.active);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Announcement Management</h1>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-900/60 bg-red-950/50 text-red-200">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/40 text-emerald-100">
            {successMessage}
          </div>
        )}

        {/* Active Announcement Alert */}
        {activeAnnouncement && (
          <div className={`mb-8 p-4 border-2 rounded-xl ${priorityColors[activeAnnouncement.priority]}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{activeAnnouncement.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Currently Active</h3>
                <p className="text-slate-100 mb-3">{activeAnnouncement.message}</p>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className={`px-3 py-1 rounded-full ${priorityBadgeColors[activeAnnouncement.priority]}`}>
                    {activeAnnouncement.priority.charAt(0).toUpperCase() + activeAnnouncement.priority.slice(1)}
                  </span>
                  <span>Created: {new Date(activeAnnouncement.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 mb-8 shadow-xl shadow-black/20">
          <h2 className="text-2xl font-bold text-white mb-6">
            {editingId ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>

          <form onSubmit={handlePublish} className="space-y-6">
            {/* Message Input */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter announcement message..."
                rows="4"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
              />
              <p className="text-sm text-slate-500 mt-1">{message.length}/500 characters</p>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
                Priority Level
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
              </select>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setIcon(opt)}
                    className={`text-3xl p-2 rounded-lg border-2 transition-all ${
                      icon === opt
                        ? 'border-emerald-500 bg-emerald-950/40'
                        : 'border-slate-700 bg-slate-950 hover:border-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-hide */}
            <div>
              <label htmlFor="autoHide" className="block text-sm font-medium text-slate-300 mb-2">
                Auto-hide After (seconds) - Leave empty for no auto-hide
              </label>
              <input
                id="autoHide"
                type="number"
                value={autoHideSeconds}
                onChange={(e) => setAutoHideSeconds(e.target.value)}
                placeholder="e.g., 10 for 10 seconds"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-start">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Publishing...' : editingId ? 'Update & Publish' : 'Publish Announcement'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Announcements List */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl shadow-black/20">
          <div className="px-8 py-6 border-b border-slate-800">
            <h2 className="text-2xl font-bold text-white">All Announcements</h2>
          </div>

          {announcements.length === 0 ? (
            <div className="px-8 py-6 text-center text-slate-400">
              No announcements yet. Create one to get started!
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="px-8 py-6 hover:bg-slate-950/60 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{announcement.icon}</span>
                        <div>
                          <p className="text-white font-semibold">{announcement.message}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-slate-300">
                            <span className={`px-2 py-1 rounded ${priorityBadgeColors[announcement.priority]}`}>
                              {announcement.priority}
                            </span>
                            {announcement.active && (
                              <span className="px-2 py-1 bg-green-200 text-green-800 rounded">Active</span>
                            )}
                            {announcement.autoHideSeconds && (
                              <span className="text-slate-500">
                                Auto-hides: {announcement.autoHideSeconds}s
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(announcement.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
