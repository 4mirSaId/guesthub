'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const socket = useSocket();

  // Fetch initial announcement on mount
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/announcement');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setAnnouncement(data);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch announcement:', error);
      }
    };

    fetchAnnouncement();
  }, []);

  // Listen to real-time updates via Socket.IO
  useEffect(() => {
    if (!socket) return;

    socket.on('announcement-update', (updatedAnnouncement) => {
      if (updatedAnnouncement) {
        setAnnouncement(updatedAnnouncement);
        setIsVisible(true);
        setIsClosing(false);

        // Auto-hide if specified
        if (updatedAnnouncement.autoHideSeconds) {
          setTimeout(() => {
            setIsClosing(true);
            setTimeout(() => setIsVisible(false), 300);
          }, updatedAnnouncement.autoHideSeconds * 1000);
        }
      } else {
        // No active announcement
        setIsClosing(true);
        setTimeout(() => {
          setIsVisible(false);
          setAnnouncement(null);
        }, 300);
      }
    });

    return () => {
      socket.off('announcement-update');
    };
  }, [socket]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible || !announcement) return null;

  const priorityStyles = {
    danger: 'bg-red-600 border-red-700',
    warning: 'bg-amber-600 border-amber-700',
    info: 'bg-blue-600 border-blue-700'
  };

  const priorityClass = priorityStyles[announcement.priority] || priorityStyles.warning;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 border-b-2 transition-all duration-300 ease-in-out ${priorityClass} ${
        isClosing ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="max-w-full mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-xl flex-shrink-0">{announcement.icon}</span>
            <p className="text-white font-bold text-sm sm:text-base">
              {announcement.message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 inline-flex text-white hover:bg-white/20 rounded-md p-1 transition-colors duration-200"
            aria-label="Close announcement"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
