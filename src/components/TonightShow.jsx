'use client';

import { useState, useEffect } from 'react';
import { getApiBase } from '@/lib/apiBase';

const TonightShow = () => {
  const weekA = {
    1: { name: "Variety Show", emoji: "🎭" },
    2: { name: "Karaoke Hits", emoji: "🎤" },
    3: { name: "Tunisian Night", emoji: "🇹🇳" },
    4: { name: "Dance Around the World", emoji: "🌍" },
    5: { name: "Miss Hotel Name", emoji: "👑" },
    6: { name: "Acting Show", emoji: "🎬" },
    0: { name: "White Party", emoji: "⚪" }
  };

  const weekB = {
    1: { name: "Mix Show", emoji: "🔀" },
    2: { name: "Games and Dance (Rosa Talent)", emoji: "🎮" },
    3: { name: "Tunisian Beats", emoji: "🥁" },
    4: { name: "Comedy Show", emoji: "😂" },
    5: { name: "Mister Hotel Name", emoji: "🤴" },
    6: { name: "Best of Rosa", emoji: "⭐" },
    0: { name: "Pink Party", emoji: "🩷" }
  };

  const [currentShow, setCurrentShow] = useState({ name: '', emoji: '' });
  const [currentDay, setCurrentDay] = useState('');
  const [currentWeek, setCurrentWeek] = useState('A');

  useEffect(() => {
    // Fetch current week setting
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${getApiBase()}/api/settings`);
        if (!response.ok) {
          setCurrentWeek('A');
          return;
        }
        const data = await response.json();
        setCurrentWeek(data.currentWeek || 'A');
      } catch {
        setCurrentWeek('A');
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const day = now.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const program = currentWeek === "A" ? weekA : weekB;
      setCurrentDay(dayNames[day]);
      setCurrentShow(program[day] || { name: "No show today", emoji: "❓" });
    };

    update();

    // Auto-update at midnight
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const timeToMidnight = midnight - now;

    const timer = setTimeout(() => {
      update();
      // Set daily interval
      const interval = setInterval(update, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, timeToMidnight);

    return () => clearTimeout(timer);
  }, [currentWeek]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/30 p-6 sm:p-8 w-full max-w-sm mx-auto text-center transition-all duration-500 ease-in-out hover:scale-105">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Tonight&apos;s Show</h2>
      <p className="text-base sm:text-lg text-slate-400 mb-2">{currentDay}</p>
      <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-2">
        {currentShow.emoji} {currentShow.name}
      </p>
    </div>
  );
};

export default TonightShow;