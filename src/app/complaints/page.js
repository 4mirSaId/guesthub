'use client';

import { useState } from 'react';
import { getApiBase } from '@/lib/apiBase';

export default function ComplaintsPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    roomNumber: '',
    complaintText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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

    try {
      const response = await fetch(`${getApiBase()}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Thank you for your feedback! Your complaint has been submitted successfully.');
        setFormData({
          fullName: '',
          roomNumber: '',
          complaintText: ''
        });
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to submit complaint. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Submit a Complaint</h1>
          <p className="text-slate-400">We value your feedback. Please let us know how we can improve your stay.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="roomNumber" className="block text-sm font-medium text-slate-300 mb-1">
              Room Number *
            </label>
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500"
              placeholder="Enter your room number"
            />
          </div>

          <div>
            <label htmlFor="complaintText" className="block text-sm font-medium text-slate-300 mb-1">
              Complaint Details *
            </label>
            <textarea
              id="complaintText"
              name="complaintText"
              value={formData.complaintText}
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 resize-y min-h-[120px]"
              placeholder="Please describe your complaint in detail..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold py-3.5 text-base shadow-lg shadow-emerald-900/30 transition-colors duration-300"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
              message.includes('Thank you')
                ? 'border-emerald-900/60 bg-emerald-950/40 text-emerald-100'
                : 'border-red-900/60 bg-red-950/50 text-red-200'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}