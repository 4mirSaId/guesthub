'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getApiBase } from '@/lib/apiBase';

export default function LoginPage() {
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
      const response = await fetch(`${getApiBase()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Store token in localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUsername', username);
        // Redirect to admin panel
        router.push('/admin');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 shadow-xl shadow-black/30 w-full max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-center text-white">DJ Space</h1>
        <p className="text-center text-slate-400 mb-12 text-lg">Hotel Name Community Control Center</p>
        
        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label htmlFor="username" className="block text-lg font-medium mb-3 text-slate-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-6 py-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 text-lg transition-all duration-300 ease-in-out shadow-sm"
              placeholder="Enter username"
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-lg font-medium mb-3 text-slate-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-6 py-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 text-lg transition-all duration-300 ease-in-out shadow-sm"
              placeholder="Enter password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-900/60 bg-red-950/50 px-6 py-4 text-base text-red-200 shadow-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold py-4 px-8 transition-all duration-300 ease-in-out shadow-lg shadow-emerald-900/30 text-lg"
          >
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <div className="mt-12 p-6 rounded-xl border border-slate-800 bg-slate-950/60 text-center text-slate-300 shadow-sm">
          <p className="font-semibold mb-3 text-lg">Demo Credentials:</p>
          <p className="text-emerald-300">Username: <span className="font-medium text-slate-100">admin</span></p>
          <p className="text-emerald-300">Password: <span className="font-medium text-slate-100">dj2026!secure</span></p>
        </div>
      </div>
    </div>
  );
}
