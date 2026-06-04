'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import io from 'socket.io-client';
import { getSocketBase } from '@/lib/socketBase';
import { socketClientOptions } from '@/lib/socketClientOptions';

export default function RequestPage() {
  const { t } = useLanguage();
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fullName, setFullName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintMessage, setComplaintMessage] = useState('');
  const [settings, setSettings] = useState({
    partyName: 'Hotel GuestHub Community',
    theme: {
      bgColor: '#ffffff',
      accentColor: '#10b981',
      textColor: '#1f2937',
      cardBgColor: '#ffffff'
    }
  });

  useEffect(() => {
    let active = true;

    // Fetch initial settings
    const loadSettings = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/settings');
        if (!response.ok) return;
        const data = await response.json();
        if (active) setSettings(data);
      } catch {
        /* API offline */
      }
    };

    loadSettings();

    // Socket.IO for real-time settings updates
    const socketBase = getSocketBase();
    if (!socketBase) {
      return () => {
        active = false;
      };
    }

    const socket = io(socketBase, { ...socketClientOptions });

    socket.on('settings-updated', (updatedSettings) => {
      if (active) setSettings(updatedSettings);
    });

    return () => {
      active = false;
      socket.off('settings-updated');
      socket.disconnect();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!song.trim()) {
      setMessage(t('pages.songRequest.songRequired'));
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ song, artist }),
      });

      if (response.ok) {
        setMessage(t('pages.songRequest.requestSuccess'));
        setSong('');
        setArtist('');
      } else {
        const error = await response.json();
        setMessage(error.error || t('pages.songRequest.requestFailed'));
      }
    } catch (error) {
      setMessage(t('pages.songRequest.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !roomNumber.trim() || !complaintText.trim()) {
      setComplaintMessage('Please complete all complaint fields.');
      return;
    }

    setComplaintLoading(true);
    setComplaintMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, roomNumber, complaintText }),
      });

      if (response.ok) {
        setComplaintMessage('Complaint submitted successfully!');
        setFullName('');
        setRoomNumber('');
        setComplaintText('');
      } else {
        const error = await response.json();
        setComplaintMessage(error.error || 'Failed to submit complaint');
      }
    } catch (error) {
      setComplaintMessage('Network error. Please try again.');
    } finally {
      setComplaintLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('pages.songRequest.title')}</h1>
          <p className="text-slate-400">{t('pages.songRequest.intro')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="song" className="block text-sm font-medium text-slate-300 mb-1">
              {t('pages.songRequest.songLabel')}
            </label>
            <input
              type="text"
              id="song"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
              placeholder={t('pages.songRequest.songPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-slate-300 mb-1">
              {t('pages.songRequest.artistLabel')}
            </label>
            <input
              type="text"
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
              placeholder={t('pages.songRequest.artistPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold py-3.5 text-base shadow-lg shadow-emerald-900/30 transition-colors duration-300"
          >
            {loading ? t('pages.songRequest.submitting') : t('pages.songRequest.submitButton')}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
              message.includes('successfully')
                ? 'border-emerald-900/60 bg-emerald-950/40 text-emerald-100'
                : 'border-red-900/60 bg-red-950/50 text-red-200'
            }`}
          >
            {message}
          </div>
        )}

      </div>
    </div>
  );
}
