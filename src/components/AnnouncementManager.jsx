'use client';

import { useCallback, useEffect, useState } from 'react';
import { getApiBase } from '@/lib/apiBase';

const iconOptions = ['!', 'i', '*'];

const priorityColors = {
  danger: 'border-red-900/70 bg-red-950/35',
  warning: 'border-amber-900/70 bg-amber-950/25',
  info: 'border-sky-900/70 bg-sky-950/25',
};

const priorityBadgeColors = {
  danger: 'bg-red-950/60 text-red-200 border border-red-900/60',
  warning: 'bg-amber-950/40 text-amber-200 border border-amber-900/60',
  info: 'bg-sky-950/40 text-sky-200 border border-sky-900/60',
};

async function requestAnnouncements() {
  const response = await fetch(`${getApiBase()}/api/announcement/all`);
  if (!response.ok) throw new Error('Failed to fetch announcements');

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export default function AnnouncementManager({ embedded = false }) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('warning');
  const [icon, setIcon] = useState('!');
  const [autoHideSeconds, setAutoHideSeconds] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAnnouncements = useCallback(async () => {
    try {
      const data = await requestAnnouncements();
      setAnnouncements(data);
    } catch (fetchError) {
      console.error('Failed to fetch announcements:', fetchError);
      setError('Failed to fetch announcements');
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadAnnouncements = async () => {
      try {
        const data = await requestAnnouncements();
        if (active) setAnnouncements(data);
      } catch (fetchError) {
        console.error('Failed to fetch announcements:', fetchError);
        if (active) setError('Failed to fetch announcements');
      }
    };

    loadAnnouncements();

    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setMessage('');
    setAutoHideSeconds('');
    setPriority('warning');
    setIcon('!');
    setEditingId(null);
  };

  const handlePublish = async (event) => {
    event.preventDefault();
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

      const payload = {
        message: message.trim(),
        priority,
        icon,
        active: true,
        autoHideSeconds: null,
      };

      if (autoHideSeconds.trim()) {
        const seconds = Number.parseInt(autoHideSeconds, 10);
        if (Number.isNaN(seconds) || seconds < 1) {
          setError('Auto-hide must be a positive number of seconds.');
          setLoading(false);
          return;
        }
        payload.autoHideSeconds = seconds;
      }

      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to publish announcement');
        return;
      }

      setSuccessMessage(editingId ? 'Announcement updated and published.' : 'Announcement published.');
      resetForm();
      await fetchAnnouncements();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (publishError) {
      console.error('Error publishing announcement:', publishError);
      setError('Failed to publish announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${getApiBase()}/api/announcement/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        setError('Failed to delete announcement');
        return;
      }

      setSuccessMessage('Announcement deleted.');
      if (editingId === id) resetForm();
      await fetchAnnouncements();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (deleteError) {
      console.error('Error deleting announcement:', deleteError);
      setError('Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setMessage(announcement.message || '');
    setPriority(announcement.priority || 'warning');
    setIcon(announcement.icon || '!');
    setAutoHideSeconds(announcement.autoHideSeconds ? String(announcement.autoHideSeconds) : '');
    setEditingId(announcement._id);
    setError('');
    setSuccessMessage('');
  };

  const activeAnnouncement = announcements.find((announcement) => announcement.active);
  const shellClass = embedded
    ? 'text-slate-100'
    : 'min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8';
  const innerClass = embedded ? 'max-w-6xl' : 'max-w-4xl mx-auto';

  return (
    <div className={shellClass}>
      <div className={innerClass}>
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white">Announcement Management</h2>
          <p className="mt-2 text-slate-400">
            Publish urgent notes that appear at the top of the public site in real time.
          </p>
        </div>

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

        {activeAnnouncement && (
          <div className={`mb-8 p-4 border-2 rounded-xl ${priorityColors[activeAnnouncement.priority]}`}>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950/70 text-lg font-bold">
                {activeAnnouncement.icon}
              </span>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2 text-white">Currently active</h3>
                <p className="text-slate-100 mb-3">{activeAnnouncement.message}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span className={`px-3 py-1 rounded-full ${priorityBadgeColors[activeAnnouncement.priority]}`}>
                    {activeAnnouncement.priority}
                  </span>
                  <span>Created: {new Date(activeAnnouncement.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 mb-8 shadow-xl shadow-black/20">
          <h3 className="text-2xl font-bold text-white mb-6">
            {editingId ? 'Edit announcement' : 'Create announcement'}
          </h3>

          <form onSubmit={handlePublish} className="space-y-6">
            <div>
              <label htmlFor="announcement-message" className="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <textarea
                id="announcement-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Enter announcement message..."
                rows="4"
                maxLength={500}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
              />
              <p className="text-sm text-slate-500 mt-1">{message.length}/500 characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label htmlFor="announcement-priority" className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  id="announcement-priority"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                </select>
              </div>

              <div>
                <span className="block text-sm font-medium text-slate-300 mb-2">Icon</span>
                <div className="flex gap-2">
                  {iconOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setIcon(option)}
                      className={`h-12 w-12 rounded-xl border text-lg font-bold transition-colors ${
                        icon === option
                          ? 'border-emerald-500 bg-emerald-950/40 text-white'
                          : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600'
                      }`}
                      aria-pressed={icon === option}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="announcement-auto-hide" className="block text-sm font-medium text-slate-300 mb-2">
                  Auto-hide seconds
                </label>
                <input
                  id="announcement-auto-hide"
                  type="number"
                  min="1"
                  value={autoHideSeconds}
                  onChange={(event) => setAutoHideSeconds(event.target.value)}
                  placeholder="Leave empty"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Publishing...' : editingId ? 'Update and publish' : 'Publish announcement'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl transition-colors"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl shadow-black/20">
          <div className="px-6 sm:px-8 py-6 border-b border-slate-800">
            <h3 className="text-2xl font-bold text-white">All announcements</h3>
          </div>

          {announcements.length === 0 ? (
            <div className="px-8 py-8 text-center text-slate-400">
              No announcements yet. Create one to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="px-6 sm:px-8 py-6 hover:bg-slate-950/60 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-lg font-bold">
                        {announcement.icon}
                      </span>
                      <div>
                        <p className="text-white font-semibold">{announcement.message}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-300">
                          <span className={`px-2 py-1 rounded ${priorityBadgeColors[announcement.priority]}`}>
                            {announcement.priority}
                          </span>
                          {announcement.active && (
                            <span className="px-2 py-1 bg-emerald-950/50 text-emerald-200 border border-emerald-900/60 rounded">
                              Active
                            </span>
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

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(announcement)}
                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
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
