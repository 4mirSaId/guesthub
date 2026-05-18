'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { getApiBase } from '@/lib/apiBase';
import { socketClientOptions } from '@/lib/socketClientOptions';

function formatCreatedAt(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default function SpecialEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      try {
        const response = await fetch(`${getApiBase()}/api/events`);
        if (!response.ok) throw new Error('Failed to load events');

        const data = await response.json();
        if (active) setEvents(Array.isArray(data) ? data : []);
      } catch {
        if (active) setEvents([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadEvents();

    const socket = io(getApiBase(), {
      ...socketClientOptions,
      forceNew: true,
    });

    socket.on('new-event', (newEvent) => {
      if (!active || !newEvent?._id) return;
      setEvents((current) => {
        if (current.some((event) => event._id === newEvent._id)) return current;
        return [newEvent, ...current];
      });
    });

    socket.on('update-event', (updatedEvent) => {
      if (!active || !updatedEvent?._id) return;
      setEvents((current) =>
        current.map((event) => (event._id === updatedEvent._id ? updatedEvent : event))
      );
    });

    socket.on('delete-event', (deletedEventId) => {
      if (!active || !deletedEventId) return;
      setEvents((current) => current.filter((event) => event._id !== deletedEventId));
    });

    return () => {
      active = false;
      socket.off('new-event');
      socket.off('update-event');
      socket.off('delete-event');
      socket.disconnect();
    };
  }, []);

  return (
    <section className="px-4 sm:px-6 md:px-8 py-10 sm:py-14 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Special events
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
            Latest events announced by the animation team.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
            No special events announced yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {events.map((event) => (
              <article
                key={event._id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-semibold">
                      {event.time}
                    </p>
                    <h3 className="mt-3 text-lg sm:text-xl font-bold text-white tracking-tight">
                      {event.eventName}
                    </h3>
                  </div>
                  {formatCreatedAt(event.createdAt) && (
                    <span className="shrink-0 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                      {formatCreatedAt(event.createdAt)}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm font-medium text-slate-300">
                  {event.location}
                </p>

                {event.moreInfo && (
                  <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {event.moreInfo}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
