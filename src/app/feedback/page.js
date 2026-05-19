'use client';

import { useEffect, useState } from 'react';

const TYPES = [
  { value: 'Service', label: 'Service' },
  { value: 'Restaurant', label: 'Restaurant' },
  { value: 'Animation', label: 'Animation' },
  { value: 'General', label: 'General' },
];

function ensureClientId() {
  if (typeof window === 'undefined') return null;
  if (!localStorage.getItem('clientId')) {
    localStorage.setItem('clientId', crypto.randomUUID());
  }
  return localStorage.getItem('clientId');
}

export default function FeedbackPage() {
  const [type, setType] = useState('General');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    ensureClientId();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (rating < 1 || rating > 5) {
      setError('Please select a rating from 1 to 5 stars.');
      return;
    }

    const clientId = ensureClientId();
    if (!clientId) {
      setError('Unable to save your session. Please enable storage and try again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          rating,
          comment: comment.trim(),
          clientId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
      setComment('');
      setRating(0);
      setType('General');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Your feedback
          </h1>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            Quick and anonymous — help us improve your stay.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-xl shadow-black/30 space-y-6"
        >
          <div>
            <label htmlFor="fb-type" className="block text-sm font-medium text-slate-300 mb-2">
              Type
            </label>
            <select
              id="fb-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-300 mb-3">Rating</span>
            <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`flex-1 min-w-[2.75rem] rounded-xl py-3 text-lg font-semibold transition-all duration-200 border ${
                    rating === n
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-900/40'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                  aria-pressed={rating === n}
                >
                  {n}★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="fb-comment" className="block text-sm font-medium text-slate-300 mb-2">
              Comment <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="fb-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell us more…"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 resize-y min-h-[120px]"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-900/60 bg-red-950/50 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100">
              Thanks for your feedback.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold py-3.5 text-base shadow-lg shadow-emerald-900/30 transition-colors duration-300"
          >
            {loading ? 'Sending…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
