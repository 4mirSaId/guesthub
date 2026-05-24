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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('pages.complaints.title')}</h1>
          <p className="text-gray-600">{t('pages.complaints.intro')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('pages.complaints.fullNameLabel')}
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
              placeholder={t('pages.complaints.fullNamePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">
              {t('pages.complaints.roomNumberLabel')}
            </label>
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
              placeholder={t('pages.complaints.roomNumberPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="complaintText" className="block text-sm font-medium text-gray-700 mb-1">
              {t('pages.complaints.complaintDetailsLabel')}
            </label>
            <textarea
              id="complaintText"
              name="complaintText"
              value={formData.complaintText}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800"
              placeholder={t('pages.complaints.complaintDetailsPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {isSubmitting ? t('pages.complaints.submitting') : t('pages.complaints.submitButton')}
          </button>
        </form>

        {message && (
          <div className={`mt-6 p-4 rounded-md ${isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
