'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const getTypeOptions = (t) => [
  { value: 'Service', label: t('pages.feedback.typeService') },
  { value: 'Restaurant', label: t('pages.feedback.typeRestaurant') },
  { value: 'Animation', label: t('pages.feedback.typeAnimation') },
  { value: 'General', label: t('pages.feedback.typeGeneral') },
];

function ensureClientId() {
  if (typeof window === 'undefined') return null;
  if (!localStorage.getItem('clientId')) {
    localStorage.setItem('clientId', crypto.randomUUID());
  }
  return localStorage.getItem('clientId');
}

export default function FeedbackPage() {
  const { t } = useLanguage();
  const TYPES = getTypeOptions(t);
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
      setError(t('pages.feedback.errorSelectRating'));
      return;
    }

    const clientId = ensureClientId();
    if (!clientId) {
      setError(t('pages.feedback.errorStorage'));
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
        setError(data.error || t('pages.feedback.errorDefault'));
        return;
      }

      setSuccess(true);
      setComment('');
      setRating(0);
      setType('General');
    } catch {
      setError(t('pages.feedback.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guest-page py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="guest-header -mx-4 -mt-12 mb-8 px-4 pb-14 pt-12 text-center sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <h1 className="text-3xl font-semibold text-white tracking-tight sm:text-4xl">
            {t('pages.feedback.title')}
          </h1>
          <p className="mt-3 text-sm text-white/70 sm:text-base">
            {t('pages.feedback.intro')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="guest-form-surface relative space-y-6 p-6 sm:p-8"
        >
          <div>
            <label htmlFor="fb-type" className="block text-sm font-medium text-slate-300 mb-2">
              {t('pages.feedback.typeLabel')}
            </label>
            <select
              id="fb-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="guest-input"
            >
              {TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-300 mb-3">{t('pages.feedback.ratingLabel')}</span>
            <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`flex-1 min-w-[2.75rem] rounded-xl py-3 text-lg font-semibold transition-all duration-200 border ${
                    rating === n
                      ? 'border-[var(--gold)] bg-[var(--gold)] text-white shadow-lg'
                      : 'border-[var(--line)] bg-transparent text-[var(--gold)] hover:border-[var(--gold)]'
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
              {t('pages.feedback.commentLabel')} <span className="text-slate-500 font-normal">{t('pages.feedback.commentOptional')}</span>
            </label>
            <textarea
              id="fb-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder={t('pages.feedback.commentPlaceholder')}
              className="guest-input min-h-[120px] resize-y"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-[var(--coral)]/40 bg-[var(--coral)]/10 px-4 py-3 text-sm text-[var(--coral-deep)]">
              {error}
            </div>
          )}

          {success && (
            <div className="success-note flex items-center px-4 py-3 text-sm">
              {t('pages.feedback.successMessage')}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[18px] bg-[var(--gold)] py-3.5 text-base font-semibold text-white shadow-lg shadow-[var(--gold)]/20 transition-colors duration-300 hover:bg-[var(--coral)] disabled:bg-slate-300 disabled:text-slate-500"
          >
            {loading ? t('pages.feedback.sending') : t('pages.feedback.submitButton')}
          </button>
        </form>
      </div>
    </div>
  );
}
