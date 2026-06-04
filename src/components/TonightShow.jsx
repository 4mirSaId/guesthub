'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import io from 'socket.io-client';
import { getSocketBase } from '@/lib/socketBase';
import { socketClientOptions } from '@/lib/socketClientOptions';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function buildDayMap(items = []) {
  const map = {};
  items.forEach((item) => {
    const index = DAY_NAMES.indexOf(item.day);
    if (index >= 0) {
      map[index] = { name: item.show, emoji: item.emoji || '' };
    }
  });
  return map;
}

const TonightShow = () => {
  const [weekA, setWeekA] = useState({});
  const [weekB, setWeekB] = useState({});
  const [currentShow, setCurrentShow] = useState({ name: '', emoji: '' });
  const [currentDay, setCurrentDay] = useState('');
  const [currentWeek, setCurrentWeek] = useState('A');
  const { t, language } = useLanguage();

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [settingsRes, programRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/program'),
        ]);

        if (active && settingsRes.ok) {
          const settings = await settingsRes.json();
          setCurrentWeek(settings.currentWeek || 'A');
        }

        if (active && programRes.ok) {
          const program = await programRes.json();
          setWeekA(buildDayMap(program.nightShows?.weekA));
          setWeekB(buildDayMap(program.nightShows?.weekB));
        }
      } catch {
        if (active) setCurrentWeek('A');
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
    socket.on('program-updated', (program) => {
      if (active) {
        setWeekA(buildDayMap(program.nightShows?.weekA));
        setWeekB(buildDayMap(program.nightShows?.weekB));
      }
    });
    socket.on('settings-updated', (settings) => {
      if (active) setCurrentWeek(settings.currentWeek || 'A');
    });

    return () => {
      active = false;
      socket.disconnect();
    };
  }, []);

  const program = useMemo(
    () => (currentWeek === 'A' ? weekA : weekB),
    [currentWeek, weekA, weekB]
  );

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const day = now.getDay();
      setCurrentDay(now.toLocaleDateString(language, { weekday: 'long' }));
      setCurrentShow(program[day] || { name: 'No show today', emoji: '' });
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [program]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/30 p-6 sm:p-8 w-full max-w-sm mx-auto text-center transition-all duration-500 ease-in-out hover:scale-105">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{t('pages.nightShows.title')}</h2>
      <p className="text-base sm:text-lg text-slate-400 mb-2">{currentDay}</p>
      <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-2">
        {currentShow.name}
      </p>
    </div>
  );
};

export default TonightShow;
