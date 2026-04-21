'use client';

import { useState, useEffect } from 'react';

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/weather');
        if (!response.ok) {
          throw new Error('Failed to fetch weather');
        }
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      <div className="max-w-6xl mx-auto py-20 px-6">
        <h1 className="text-5xl font-bold mb-6 text-center text-gray-800">
          Weather Today ☀️
        </h1>
        <p className="text-xl text-gray-500 mb-12 text-center">
          Current conditions in Skanes, Monastir, Tunisia
        </p>

        <div className="max-w-md mx-auto">
          {loading ? (
            <div className="bg-neutral-50 p-8 rounded-2xl shadow-md border border-gray-100 text-center">
              <div className="text-xl">Loading weather...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-8 rounded-2xl shadow-md border border-red-200 text-center">
              <div className="text-red-700 text-xl">Error: {error}</div>
            </div>
          ) : weather ? (
            <div className="bg-neutral-50 p-8 rounded-2xl shadow-md border border-gray-100 text-center">
              <div className="text-6xl font-bold text-emerald-500 mb-4">
                {weather.temperature}°C
              </div>
              <div className="text-xl text-gray-600 mb-2">
                {weather.location}
              </div>
              <div className="text-lg text-gray-500 capitalize">
                {weather.description}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}