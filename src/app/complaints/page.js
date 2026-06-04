'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function ComplaintsPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    roomNumber: '',
    complaintText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setMessage(t('pages.complaints.successMessage'));
        setFormData({
          fullName: '',
          roomNumber: '',
          complaintText: ''
        });
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || t('pages.complaints.failureMessage'));
      }
    } catch (error) {
      setMessage(t('pages.complaints.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-slate-900 rounded-2xl shadow-xl shadow-black/20 border border-slate-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('pages.complaints.title')}</h1>
          <p className="text-slate-400">{t('pages.complaints.intro')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
              {t('pages.complaints.fullNameLabel')}
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-800 text-white placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              placeholder={t('pages.complaints.fullNamePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-white mb-2">
              {t('pages.complaints.roomNumberLabel')}
            </label>
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-800 text-white placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
              placeholder={t('pages.complaints.roomNumberPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="complaintText" className="block text-sm font-medium text-white mb-2">
              {t('pages.complaints.complaintDetailsLabel')}
            </label>
            <textarea
              id="complaintText"
              name="complaintText"
              value={formData.complaintText}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-slate-700 rounded-xl bg-slate-800 text-white placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 resize-vertical"
              placeholder={t('pages.complaints.complaintDetailsPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700/50 text-white font-semibold py-3 px-4 rounded-xl transition duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? t('pages.complaints.submitting') : t('pages.complaints.submitButton')}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-xl ${isSuccess ? 'bg-emerald-900/30 border border-emerald-700 text-emerald-200' : 'bg-red-900/30 border border-red-700 text-red-200'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
