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
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <div className="max-w-6xl mx-auto py-20 px-6">
        <h1 className="text-5xl font-bold mb-12 text-center text-white">
          {t('pages.activities.heroTitle')}
        </h1>

        {loading ? (
          <p className="text-center text-slate-400 text-xl">{t('pages.activities.loading')}</p>
        ) : activities.length === 0 ? (
          <p className="text-center text-slate-400 text-xl py-16 rounded-2xl border border-slate-800 bg-slate-900/60 max-w-4xl mx-auto">
            {t('pages.activities.empty')}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {activities.map((act) => (
              <div
                key={act._id || `${act.time}-${act.name}`}
                className="bg-slate-900 p-8 rounded-2xl shadow-xl shadow-black/20 hover:shadow-black/40 hover:scale-[1.02] border border-slate-800 transition-all duration-300 ease-in-out"
              >
                <span className="text-2xl font-bold text-emerald-400 block mb-2">{act.time}</span>
                <span className="text-lg text-slate-200">{act.name}</span>
              </div>
            ))}
          </div>
        )}

        {kidsClub.length > 0 && (
          <section className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white">{t('pages.activities.kidsClubTitle')}</h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-xl shadow-black/20">
              <div className="hidden sm:grid sm:grid-cols-[7rem_1fr] gap-4 px-2 pb-4 mb-2 border-b border-slate-800 text-sm font-semibold uppercase tracking-wider text-slate-500">
                <span>{t('pages.activities.dayLabel')}</span>
                <span>{t('pages.activities.sessionsLabel')}</span>
              </div>

              <div className="space-y-4">
                {kidsClub.map((dayItem) => (
                  <div
                    key={dayItem._id || dayItem.day}
                    className="rounded-xl bg-slate-950 border border-slate-800 p-4 sm:p-5 sm:grid sm:grid-cols-[7rem_1fr] sm:gap-4 sm:items-start"
                  >
                    <p className="text-lg font-semibold text-emerald-400 mb-3 sm:mb-0">{dayItem.day}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(dayItem.sessions || []).map((session) => (
                        <div
                          key={session._id || `${session.label}-${session.startTime}`}
                          className="rounded-lg bg-slate-900/80 border border-slate-800 px-4 py-3"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {session.label}
                          </p>
                          <p className="text-base font-medium text-white mt-0.5">
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
    </div>
  );
}
