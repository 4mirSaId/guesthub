'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import io from 'socket.io-client';
import { getSocketBase } from '@/lib/socketBase';
import { socketClientOptions } from '@/lib/socketClientOptions';

function ShowWeek({ title, items }) {
  const { t } = useLanguage();

  return (
    <section className="schedule-card rounded-2xl border p-5 shadow-[0_10px_20px_rgba(9,43,62,0.08)] sm:p-6">
      <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-4">
        <h2 className="text-2xl font-semibold text-[var(--navy-deep)]">{title}</h2>
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--coral)]" aria-hidden="true" />
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-[var(--ink-soft)]">{t('pages.nightShows.noNightShows')}</p>
        ) : (
          items.map((item) => (
            <div
              key={item._id || item.day}
              className="rounded-xl border border-[var(--line)] bg-[var(--sand)] p-4 transition hover:border-[var(--teal)] sm:p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">{item.day}</p>
                  <p className="mt-2 text-xl font-semibold text-[var(--navy-deep)]">{item.show}</p>
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
        const res = await fetch('/api/program');
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
    <main className="schedule-page min-h-screen px-4 pb-16 pt-12 sm:px-6 md:px-8 md:pt-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-[var(--line)] pb-6 sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--coral)]">Live entertainment</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--navy-deep)] sm:text-4xl">{t('pages.nightShows.title')}</h1>
          <p className="mt-3 max-w-2xl text-base text-[var(--ink-soft)]">
            {t('pages.nightShows.description')}
          </p>
        </header>

        {loading ? (
          <p className="rounded-xl border border-[var(--line)] bg-white/50 px-6 py-10 text-center text-[var(--ink-soft)]">{t('pages.nightShows.loading')}</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <ShowWeek title={t('pages.nightShows.showWeekA')} items={weekA} />
            <ShowWeek title={t('pages.nightShows.showWeekB')} items={weekB} />
          </div>
        )}
      </div>
    </main>
  );
}
