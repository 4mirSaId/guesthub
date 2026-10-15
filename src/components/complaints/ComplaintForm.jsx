'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { complaintCategories, complaintPriorities } from '@/lib/complaintConfig';

const initialForm = {
  fullName: '',
  roomNumber: '',
  category: 'housekeeping',
  subcategory: 'Room not cleaned',
  description: '',
  priority: 'medium',
  images: '',
};

export default function ComplaintForm() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState(initialForm);
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const translatedCategories = useMemo(
    () =>
      complaintCategories.map((category) => ({
        ...category,
        label: t(`pages.complaints.categories.${category.id}`) || category.label,
        issues: (category.issues || []).map((issue) => {
          const key = `pages.complaints.issues.${category.id}.${issue.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
          return t(key) || issue;
        }),
      })),
    [t]
  );

  const selectedCategory = useMemo(
    () => translatedCategories.find((item) => item.id === formData.category) || translatedCategories[translatedCategories.length - 1],
    [formData.category, translatedCategories]
  );

  const translatedPriorities = useMemo(
    () =>
      complaintPriorities.map((priority) => ({
        value: priority,
        label: t(`pages.complaints.priorities.${priority}`) || priority.charAt(0).toUpperCase() + priority.slice(1),
      })),
    [t]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleCategoryChange = (event) => {
    const nextCategory = event.target.value;
    const categoryMeta = translatedCategories.find((item) => item.id === nextCategory) || translatedCategories[translatedCategories.length - 1];
    setFormData((current) => ({
      ...current,
      category: nextCategory,
      subcategory: categoryMeta?.issues?.[0] || '',
    }));
    setCustomSubcategory('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsSuccess(false);

    const subcategoryValue = formData.category === 'other'
      ? customSubcategory.trim()
      : (formData.subcategory.trim() || selectedCategory?.issues?.[0] || '');

    const payload = {
      fullName: formData.fullName.trim(),
      roomNumber: formData.roomNumber.trim(),
      category: formData.category,
      subcategory: subcategoryValue,
      description: formData.description.trim(),
      complaintText: formData.description.trim(),
      priority: formData.priority,
      images: formData.images
        .split(',')
        .map((image) => image.trim())
        .filter(Boolean),
    };

    if (!payload.fullName || !payload.roomNumber || !payload.description || (formData.category === 'other' && !payload.subcategory)) {
      setMessage(t('pages.complaints.validationRequired'));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || t('pages.complaints.submitErrorDefault'));
      }

      setIsSuccess(true);
      setMessage(t('pages.complaints.submitSuccess'));
      setFormData(initialForm);
      setCustomSubcategory('');
    } catch (error) {
      setMessage(error.message || t('pages.complaints.submitErrorDefault'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="guest-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
        <div className="lg:w-[38%]">
          <div className="guest-header rounded-[28px] p-7">
            <div className="mb-6 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
              {t('pages.complaints.heroBadge')}
            </div>
            <h1 className="text-3xl font-semibold text-white">{t('pages.complaints.heroTitle')}</h1>
            <p className="mt-3 text-sm leading-7 text-white/70">
              {t('pages.complaints.heroDescription')}
            </p>
            <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <span>{t('pages.complaints.featureFastTriage')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{t('pages.complaints.featureEscalation')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{t('pages.complaints.featureTracking')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-[62%]">
          <div className="guest-form-surface p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-200">
                  <span className="mb-2 block">{t('pages.complaints.fullNameLabel')}</span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                    placeholder={t('pages.complaints.fullNamePlaceholder')}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-200">
                  <span className="mb-2 block">{t('pages.complaints.roomNumberLabel')}</span>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                    placeholder={t('pages.complaints.roomNumberPlaceholder')}
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-200">
                  <span className="mb-2 block">{t('pages.complaints.categoryLabel')}</span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleCategoryChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                  >
                    {translatedCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-200">
                  <span className="mb-2 block">{t('pages.complaints.issueLabel')}</span>
                  {formData.category === 'other' ? (
                    <input
                      type="text"
                      value={customSubcategory}
                      onChange={(event) => setCustomSubcategory(event.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                      placeholder={t('pages.complaints.issuePlaceholder')}
                    />
                  ) : (
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                    >
                      {selectedCategory?.issues?.map((issue) => (
                        <option key={issue} value={issue}>
                          {issue}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-200">
                <span className="mb-2 block">{t('pages.complaints.descriptionLabel')}</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                  className="w-full resize-y rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                  placeholder={t('pages.complaints.descriptionPlaceholder')}
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-200">
                  <span className="mb-2 block">{t('pages.complaints.priorityLabel')}</span>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                  >
                    {translatedPriorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-200">
                  <span className="mb-2 block">{t('pages.complaints.imagesLabel')}</span>
                  <input
                    type="text"
                    name="images"
                    value={formData.images}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                    placeholder={t('pages.complaints.imagesPlaceholder')}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-[18px] bg-[var(--coral)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--coral-deep)] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? t('pages.complaints.submitting') : t('pages.complaints.submitButton')}
              </button>
            </form>

            {message ? (
              <div className={`${isSuccess ? 'success-note' : 'rounded-2xl border border-[var(--coral)]/40 bg-[var(--coral)]/10 text-[var(--coral-deep)]'} mt-5 px-4 py-3 text-sm`}>
                {message}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
