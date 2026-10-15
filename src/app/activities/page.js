'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useLanguage } from '@/context/LanguageContext';
import { getSocketBase } from '@/lib/socketBase';
import { socketClientOptions } from '@/lib/socketClientOptions';
import { formatTimeRange } from '@/lib/formatScheduleTime';

export default function Activities() {
  const { t } = useLanguage();
  const [activities, setActivities] = useState([]);
  const [kidsClub, setKidsClub] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const applyProgram = (data) => {
      setActivities(data.activities || []);
      setKidsClub(data.kidsClub || []);
    };

    const load = async () => {
      try {
        const res = await fetch('/api/program');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (active) applyProgram(data);
      } catch {
        if (active) applyProgram({ activities: [], kidsClub: [] });
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    const socketBase = getSocketBase();
    if (!socketBase) {
      return () => {
        active = false;
      };
    }

    const socket = io(socketBase, socketClientOptions);
    socket.on('program-updated', (data) => {
      if (active) applyProgram(data);
    });

    return () => {
      active = false;
      socket.off('program-updated');
      socket.disconnect();
    };
  }, []);

  return (
    <main className="schedule-page min-h-screen px-4 pb-16 pt-12 sm:px-6 md:px-8 md:pt-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-[var(--line)] pb-6 sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--teal)]">GuestHub</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--navy-deep)] sm:text-4xl">
          {t('pages.activities.heroTitle')}
          </h1>
        </header>

        {loading ? (
          <p className="rounded-xl border border-[var(--line)] bg-white/50 px-6 py-10 text-center text-[var(--ink-soft)]">{t('pages.activities.loading')}</p>
        ) : activities.length === 0 ? (
          <p className="rounded-xl border border-[var(--line)] bg-white/50 px-6 py-16 text-center text-[var(--ink-soft)]">
            {t('pages.activities.empty')}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((act) => (
              <div
                key={act._id || `${act.time}-${act.name}`}
                className="schedule-card group rounded-2xl border p-6 shadow-[0_10px_20px_rgba(9,43,62,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--teal)]"
              >
                <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">{act.time}</span>
                <span className="mt-3 block text-xl font-semibold text-[var(--navy-deep)]">{act.name}</span>
              </div>
            ))}
          </div>
        )}

        {kidsClub.length > 0 && (
          <section className="mt-14">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">Schedule</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--navy-deep)] sm:text-3xl">{t('pages.activities.kidsClubTitle')}</h2>
            </div>

            <div className="schedule-card rounded-2xl border p-4 shadow-[0_10px_20px_rgba(9,43,62,0.08)] sm:p-6">
              <div className="mb-2 hidden border-b border-[var(--line)] px-2 pb-4 text-sm font-semibold uppercase tracking-wider text-[var(--ink-soft)] sm:grid sm:grid-cols-[7rem_1fr] sm:gap-4">
                <span>{t('pages.activities.dayLabel')}</span>
                <span>{t('pages.activities.sessionsLabel')}</span>
              </div>

              <div className="space-y-4">
                {kidsClub.map((dayItem) => (
                  <div
                    key={dayItem._id || dayItem.day}
                    className="rounded-xl border border-[var(--line)] bg-[var(--sand)] p-4 sm:grid sm:grid-cols-[7rem_1fr] sm:items-start sm:gap-4 sm:p-5"
                  >
                    <p className="mb-3 text-lg font-semibold text-[var(--navy)] sm:mb-0">{dayItem.day}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(dayItem.sessions || []).map((session) => (
                        <div
                          key={session._id || `${session.label}-${session.startTime}`}
                          className="rounded-lg border border-[var(--line)] bg-white/60 px-4 py-3"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                            {session.label}
                          </p>
                          <p className="mt-0.5 text-base font-medium text-[var(--ink)]">
                            {formatTimeRange(session.startTime, session.endTime)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
