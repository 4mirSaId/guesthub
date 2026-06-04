'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const portals = [
  {
    href: '/admin/animation/login',
    title: 'Animation',
    description: 'Song requests, special events, and party settings',
    accent: 'emerald',
  },
  {
    href: '/admin/guestrelation/login',
    title: 'Guest Relations',
    description: 'Service requests, complaints, feedback, and announcements',
    accent: 'sky',
  },
];

const accentStyles = {
  emerald: {
    card: 'hover:border-emerald-500/60 hover:shadow-emerald-900/20',
    title: 'text-emerald-400',
    button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/30',
  },
  sky: {
    card: 'hover:border-sky-500/60 hover:shadow-sky-900/20',
    title: 'text-sky-400',
    button: 'bg-sky-500 hover:bg-sky-600 shadow-sky-900/30',
  },
};

export default function AdminPortalPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check for animation login
      const animationToken = localStorage.getItem('animationToken');
      if (animationToken) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${animationToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.role === 'animation') {
              router.replace('/admin/animation');
              return;
            }
          }
        } catch (error) {
          console.error('Animation auth check failed:', error);
        }
      }

      // Check for guest relation login
      const grToken = localStorage.getItem('grToken');
      if (grToken) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${grToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.role === 'guestrelation') {
              router.replace('/admin/guestrelation');
              return;
            }
          }
        } catch (error) {
          console.error('Guest relation auth check failed:', error);
        }
      }

      // No valid auth found, show portal
      setIsChecking(false);
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Staff Portal</h1>
          <p className="text-slate-400 text-lg">Hotel GuestHub — choose your department to sign in</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {portals.map((portal) => {
            const styles = accentStyles[portal.accent];
            return (
              <Link
                key={portal.href}
                href={portal.href}
                className={`group block rounded-2xl border border-slate-800 bg-slate-900 p-8 sm:p-10 shadow-xl shadow-black/30 transition-all duration-300 ${styles.card}`}
              >
                <h2 className={`text-2xl font-bold mb-3 ${styles.title}`}>{portal.title}</h2>
                <p className="text-slate-400 text-base mb-8 leading-relaxed">{portal.description}</p>
                <span
                  className={`inline-flex items-center justify-center w-full rounded-xl text-white font-semibold py-3 px-6 shadow-lg transition-colors ${styles.button}`}
                >
                  Sign in
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
