'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const portals = [
  {
    href: '/admin/animation/login',
    title: 'Animation',
    description: 'Special events, entertainment programming, and music control.',
    accent: 'teal',
    badge: 'LIVE SHOWS',
  },
  {
    href: '/admin/guestrelation/login',
    title: 'Guest Relations',
    description: 'Service requests, complaints, feedback, and guest updates.',
    accent: 'gold',
    badge: 'GUEST CARE',
  },
];

const accentStyles = {
  teal: {
    card: 'border-[var(--line)] hover:border-[var(--teal)]/60 hover:shadow-[0_18px_30px_rgba(46,143,134,0.12)]',
    badge: 'bg-[rgba(46,143,134,0.14)] text-[var(--teal)] border border-[rgba(46,143,134,0.2)]',
    title: 'text-[var(--navy-deep)]',
    button: 'bg-[var(--teal)] hover:bg-[var(--navy)] text-white shadow-[0_12px_24px_rgba(46,143,134,0.18)]',
    glow: 'from-[rgba(46,143,134,0.18)] via-[rgba(46,143,134,0.06)] to-transparent',
  },
  gold: {
    card: 'border-[var(--line)] hover:border-[var(--gold)]/60 hover:shadow-[0_18px_30px_rgba(198,161,91,0.14)]',
    badge: 'bg-[rgba(198,161,91,0.12)] text-[var(--navy-deep)] border border-[rgba(198,161,91,0.25)]',
    title: 'text-[var(--navy-deep)]',
    button: 'bg-[var(--gold)] hover:bg-[var(--coral)] text-[var(--navy-deep)] shadow-[0_12px_24px_rgba(198,161,91,0.18)]',
    glow: 'from-[rgba(198,161,91,0.18)] via-[rgba(198,161,91,0.08)] to-transparent',
  },
};

export default function AdminPortalPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
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

      setIsChecking(false);
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[var(--sand)] text-[var(--ink)] flex items-center justify-center p-8">
        <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,252,245,0.9)] px-8 py-6 shadow-[0_18px_40px_rgba(9,43,62,0.08)]">
          <p className="text-[var(--ink-soft)] text-sm uppercase tracking-[0.22em]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--sand)] px-4 py-10 sm:px-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center sm:mb-10">
          <div className="mx-auto mb-4 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(255,252,245,0.7)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--navy-deep)] shadow-sm">
            Hotel GuestHub
          </div>
          <h1 className="text-4xl font-semibold text-[var(--navy-deep)] sm:text-5xl">Staff Portal</h1>
          <p className="mt-3 text-base text-[var(--ink-soft)] sm:text-lg">Choose your department to continue</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {portals.map((portal) => {
            const styles = accentStyles[portal.accent];
            return (
              <Link
                key={portal.href}
                href={portal.href}
                className={`group relative overflow-hidden rounded-[28px] border bg-[rgba(255,252,245,0.9)] p-6 shadow-[0_18px_40px_rgba(9,43,62,0.08)] transition-all duration-300 sm:p-8 ${styles.card}`}
              >
                <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${styles.glow}`} />
                <div className="relative z-10">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${styles.badge}`}>
                      {portal.badge}
                    </span>
                  </div>

                  <h2 className={`mb-3 text-3xl font-semibold ${styles.title}`}>{portal.title}</h2>
                  <p className="mb-7 text-base leading-relaxed text-[var(--ink-soft)]">{portal.description}</p>

                  <span className={`inline-flex w-full items-center justify-center rounded-[18px] px-5 py-3 text-base font-semibold transition-all duration-300 ${styles.button}`}>
                    Enter dashboard
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
