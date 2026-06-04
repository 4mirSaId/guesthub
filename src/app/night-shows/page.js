'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import io from 'socket.io-client';
import { getSocketBase } from '@/lib/socketBase';
import { socketClientOptions } from '@/lib/socketClientOptions';

function ShowWeek({ title, items }) {
  const { t } = useLanguage();

  return (
    <section className="rounded-2xl shadow-xl shadow-black/20 border border-slate-800 bg-slate-900 p-8 transition-all duration-300 ease-in-out hover:shadow-black/40">
      <h2 className="text-3xl font-semibold text-white mb-6">{title}</h2>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-slate-500">{t('pages.nightShows.noNightShows')}</p>
        ) : (
          items.map((item) => (
            <div
              key={item._id || item.day}
              className="rounded-2xl bg-slate-950 p-5 border border-slate-800 shadow-lg shadow-black/20 transition hover:border-slate-700"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{item.day}</p>
                  <p className="text-xl font-semibold text-white mt-2">{item.show}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default function NightShows() {
  const { t } = useLanguage();
  const [weekA, setWeekA] = useState([]);
  const [weekB, setWeekB] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const applyProgram = (data) => {
      setWeekA(data.nightShows?.weekA || []);
      setWeekB(data.nightShows?.weekB || []);
    };

    const load = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/program');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (active) applyProgram(data);
      } catch {
        if (active) applyProgram({ nightShows: { weekA: [], weekB: [] } });
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
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white">{t('pages.nightShows.title')}</h1>
          <p className="text-xl text-slate-400 mt-4">
            {t('pages.nightShows.description')}
          </p>
        </div>

        {loading ? (
          <p className="text-center text-slate-400 text-xl">{t('pages.nightShows.loading')}</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <ShowWeek title={t('pages.nightShows.showWeekA')} items={weekA} />
            <ShowWeek title={t('pages.nightShows.showWeekB')} items={weekB} />
          </div>
        )}
      </div>
    </div>
  );
}
