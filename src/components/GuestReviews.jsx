'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

function Stars({ value }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <span className="tracking-tight text-amber-400" aria-label={`${v} out of 5 stars`}>
      {'★'.repeat(v)}
      <span className="text-slate-600">{'★'.repeat(5 - v)}</span>
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
        const res = await fetch('/api/feedback/public');
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
    const trimmed = text.trim();
    return trimmed.length > 160 ? `${trimmed.slice(0, 157)}…` : trimmed;
  };

  const latestReviews = useMemo(() => items.slice(0, 3), [items]);
  const averageRating = useMemo(() => {
    if (!items.length) return 0;
    const total = items.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return (total / items.length).toFixed(1);
  }, [items]);

  return (
    <section className="border-y border-slate-800 bg-slate-950 px-4 py-14 text-slate-100 sm:px-6 sm:py-20 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              {t('pages.guestReviews.title')}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
              {t('pages.guestReviews.description')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {items.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
                <Stars value={Math.round(Number(averageRating) || 0)} />
                <span className="text-slate-400">{averageRating} · {items.length} reviews</span>
              </div>
            )}
            <Link
              href="/feedback"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-colors duration-300 hover:bg-emerald-600"
            >
              {t('pages.guestReviews.viewAllReviews')}
            </Link>
            <Link
              href="/feedback"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors duration-300 hover:bg-slate-900"
            >
              {t('pages.guestReviews.leaveFeedback')}
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400">
            {t('pages.guestReviews.loading')}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[28px] border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/60 p-10 text-center shadow-xl shadow-black/20">
            <p className="text-lg font-semibold text-white">{t('pages.guestReviews.empty')}</p>
            <p className="mt-2 text-sm text-slate-400">
              {t('pages.guestReviews.emptyAction')}
            </p>
            <Link
              href="/feedback"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-emerald-600"
            >
              {t('pages.guestReviews.leaveFeedback')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {latestReviews.map((fb) => (
              <article
                key={fb._id}
                className="flex min-h-[160px] flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg shadow-black/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <Stars value={fb.rating} />
                  <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-slate-500">
                    {fb.type}
                  </span>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-300 sm:text-base">
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
