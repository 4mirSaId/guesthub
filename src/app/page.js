"use client";

import { useState, useEffect } from 'react';
import TonightShow from '../components/TonightShow';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/events');
        if (response.ok) {
          const eventsData = await response.json();
          setEvents(eventsData);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setParallaxOffset(window.scrollY * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white text-gray-800 min-h-screen">

      {/* HERO */}
      <section 
        className="relative w-full h-screen flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: "url('/rosabeachpool.webp')",
          backgroundAttachment: 'fixed',
          backgroundPosition: `center ${parallaxOffset}px`
        }}
      >
        {/* Blur Effect */}
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        {/* Fade Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/50"></div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg leading-tight animate-fade-in">
              Welcome to Rosa Beach
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mb-6 sm:mb-8 drop-shadow-md animate-fade-in" style={{animationDelay: '0.2s'}}>
              Your Luxury Beach Resort Experience
            </p>

            <TonightShow />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
              <a href="/activities" className="w-full sm:w-auto">
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out">
                  View Activities 🏖️
                </button>
              </a>
              <a href="/night-shows" className="w-full sm:w-auto">
                <button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-lg sm:rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out">
                  Night Shows 🎭
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIAL EVENTS */}
      {events.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-gray-800 text-center">
              Special Events 🎉
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="p-6 sm:p-8 rounded-lg sm:rounded-2xl shadow-md bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100 hover:shadow-xl transition-all duration-300 ease-in-out"
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">{event.eventName}</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="flex items-center text-sm sm:text-base">
                      <span className="text-emerald-500 mr-3">🕒</span>
                      <span className="font-medium">{event.time}</span>
                    </p>
                    <p className="flex items-center text-sm sm:text-base">
                      <span className="text-emerald-500 mr-3">📍</span>
                      <span className="font-medium">{event.location}</span>
                    </p>
                    {event.moreInfo && (
                      <p className="flex items-start mt-4 text-xs sm:text-sm">
                        <span className="text-emerald-500 mr-3 flex-shrink-0">ℹ️</span>
                        <span className="whitespace-pre-line">{event.moreInfo}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ACTION */}
      <section className="text-center py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-stone-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
            Control the Music 🎶
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Send your favorite song and feel the vibe live 🔥
          </p>

          <a href="/request" className="inline-block w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg lg:text-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 ease-in-out">
              Request a Song 🎧
            </button>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-8 sm:py-12 px-4 border-t border-gray-100 text-gray-500 bg-white text-sm sm:text-base">
        Enjoy your stay ❤️ | DJ Amir
      </footer>

    </div>
  );
}