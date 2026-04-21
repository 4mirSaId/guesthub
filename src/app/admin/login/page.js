'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      const response = await fetch('http://localhost:3001/api/auth/login', {
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
    <div className="min-h-screen bg-neutral-50 text-gray-800 flex items-center justify-center p-8">
      <div className="bg-white p-12 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">DJ Space</h1>
        <p className="text-center text-gray-500 mb-12 text-lg">Rosa Beach Community Control Center</p>
        
        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label htmlFor="username" className="block text-lg font-medium mb-3 text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-lg transition-all duration-300 ease-in-out shadow-sm"
              placeholder="Enter username"
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-lg font-medium mb-3 text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 text-lg transition-all duration-300 ease-in-out shadow-sm"
              placeholder="Enter password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-lg shadow-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 ease-in-out shadow-md hover:shadow-lg text-lg"
          >
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <div className="mt-12 p-6 bg-stone-100 rounded-xl text-center text-gray-600 shadow-sm">
          <p className="font-semibold mb-3 text-lg">Demo Credentials:</p>
          <p className="text-emerald-600">Username: <span className="font-medium">admin</span></p>
          <p className="text-emerald-600">Password: <span className="font-medium">dj2026!secure</span></p>
        </div>
      </div>
    </div>
  );
}
