'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export default function RequestPage() {
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
    partyName: 'Rosa Beach Community',
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
        const data = await response.json();
        if (active) setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    loadSettings();

    // Socket.IO for real-time settings updates
    const socket = io('http://localhost:3001');

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
      setMessage('Song name is required');
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
        setMessage('Request submitted successfully!');
        setSong('');
        setArtist('');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to submit request');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Song Request</h1>
          <p className="text-gray-600">Request your favorite song and let the DJ know what you want to hear!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="song" className="block text-sm font-medium text-gray-700 mb-1">
              Song Name *
            </label>
            <input
              type="text"
              id="song"
              value={song}
              onChange={(e) => setSong(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
              placeholder="Enter song name"
            />
          </div>

          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-1">
              Artist Name (Optional)
            </label>
            <input
              type="text"
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
              placeholder="Enter artist name"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-md ${message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

      </div>
    </div>
  );
}
