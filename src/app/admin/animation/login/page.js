'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AnimationLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.role === 'animation') {
        localStorage.setItem('animationToken', data.token);
        localStorage.setItem('animationUsername', data.username || username);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        router.replace('/admin/animation');
      } else if (response.ok && data.token) {
        setError('This account is not authorized for Animation.');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--sand)] px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-[var(--line)] bg-[rgba(255,252,245,0.92)] shadow-[0_18px_40px_rgba(9,43,62,0.08)]">
          <div className="bg-gradient-to-br from-[var(--navy-deep)] via-[var(--navy)] to-[var(--teal)] px-6 py-8 text-center text-white sm:px-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xl font-semibold backdrop-blur-sm">
              HB
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/70">Hotel GuestHub</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Animation</h1>
            <p className="mt-2 text-sm text-white/75">DJ and entertainment controls</p>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="guest-input w-full rounded-[18px] border border-[var(--line)] bg-white px-4 py-3.5 text-base text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:border-[var(--teal)] focus:outline-none focus:ring-2 focus:ring-[rgba(46,143,134,0.18)]"
                  placeholder="Enter username"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="guest-input w-full rounded-[18px] border border-[var(--line)] bg-white px-4 py-3.5 text-base text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:border-[var(--teal)] focus:outline-none focus:ring-2 focus:ring-[rgba(46,143,134,0.18)]"
                  placeholder="Enter password"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-[18px] border border-[rgba(185,75,47,0.2)] bg-[rgba(217,96,63,0.08)] px-4 py-3 text-sm text-[var(--coral-deep)]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[18px] bg-[var(--teal)] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--navy)] disabled:cursor-not-allowed disabled:bg-[var(--ink-soft)]"
              >
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
              <Link href="/admin" className="font-medium text-[var(--navy)] transition hover:text-[var(--teal)]">
                ← Back to staff portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
