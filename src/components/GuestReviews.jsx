'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

function Stars({ value }) {
  return (
    <span className="text-amber-400 tracking-tight" aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(value)}
      <span className="text-slate-600">{'★'.repeat(5 - value)}</span>
    </span>
  );
}

export default function GuestReviews() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/feedback/public');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const snippet = (text) => {
    if (!text || !text.trim()) return '—';
    const t = text.trim();
    return t.length > 160 ? `${t.slice(0, 157)}…` : t;
  };

  return (
    <section className="bg-slate-950 text-slate-100 py-14 sm:py-20 px-4 sm:px-6 md:px-8 border-y border-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                {t('pages.guestReviews.title')}
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-xl">
                {t('pages.guestReviews.description')}
            </p>
          </div>
          <Link
            href="/feedback"
            className="inline-flex justify-center items-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 text-sm sm:text-base shadow-lg shadow-emerald-900/30 transition-colors duration-300"
          >
              {t('pages.guestReviews.leaveFeedback')}
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400">
            Loading reviews…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400">
            {t('pages.guestReviews.empty')}{' '}
            <Link href="/feedback" className="text-emerald-400 hover:text-emerald-300 font-medium underline-offset-2 hover:underline">
              {t('pages.guestReviews.emptyAction')}
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {items.map((fb) => (
              <article
                key={fb._id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20 flex flex-col gap-3 min-h-[140px]"
              >
                <div className="flex items-center justify-between gap-3">
                  <Stars value={fb.rating} />
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-medium shrink-0">
                    {fb.type}
                  </span>
                </div>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed flex-1">
                  {snippet(fb.comment)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
