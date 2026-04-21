'use client';

import { useState, useEffect } from 'react';

const TonightShow = () => {
  const weekA = {
    1: { name: "Variety Show", emoji: "🎭" },
    2: { name: "Karaoke Hits", emoji: "🎤" },
    3: { name: "Tunisian Night", emoji: "🇹🇳" },
    4: { name: "Dance Around the World", emoji: "🌍" },
    5: { name: "Miss Rosa Beach", emoji: "👑" },
    6: { name: "Acting Show", emoji: "🎬" },
    0: { name: "White Party", emoji: "⚪" }
  };

  const weekB = {
    1: { name: "Mix Show", emoji: "🔀" },
    2: { name: "Games and Dance (Rosa Talent)", emoji: "🎮" },
    3: { name: "Tunisian Beats", emoji: "🥁" },
    4: { name: "Comedy Show", emoji: "😂" },
    5: { name: "Mister Rosa Beach", emoji: "🤴" },
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
        const response = await fetch('http://localhost:3001/api/settings');
        const data = await response.json();
        setCurrentWeek(data.currentWeek || 'A');
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        setCurrentWeek('A'); // fallback
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
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-6 sm:p-8 w-full max-w-sm mx-auto text-center transition-all duration-500 ease-in-out hover:scale-105">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Tonight&apos;s Show</h2>
      <p className="text-base sm:text-lg text-gray-500 mb-2">{currentDay}</p>
      <p className="text-2xl sm:text-3xl font-bold text-emerald-500 mb-2">
        {currentShow.emoji} {currentShow.name}
      </p>
    </div>
  );
};

export default TonightShow;