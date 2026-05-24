"use client";

import { useState } from "react";
import { useLanguage } from '@/context/LanguageContext';
import axios from "axios";

export default function ServicePage() {
  const { t } = useLanguage();
  const [room, setRoom] = useState("");
  const [type, setType] = useState("Cleaning");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async () => {
    if (!room) {
      setFeedback(t('pages.serviceRequest.roomRequired'));
      return;
    }

    setLoading(true);
    setFeedback("");

    try {
      await axios.post("/api/service-requests", {
        room,
        type,
        message,
      });

      setRoom("");
      setMessage("");
      setFeedback(t('pages.serviceRequest.successMessage'));
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      console.error("Error submitting service request:", error);
      setFeedback(t('pages.serviceRequest.failureMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-emerald-400 mb-3">{t('pages.serviceRequest.title')}</h1>
          <p className="text-slate-400 text-lg">{t('pages.serviceRequest.intro')}</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-black/30">
          <form className="space-y-6">
            {/* Room Number */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                {t('pages.serviceRequest.roomLabel')}
              </label>
              <input
                type="text"
                placeholder={t('pages.serviceRequest.roomPlaceholder')}
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-6 py-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 text-lg transition-all duration-300"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                {t('pages.serviceRequest.typeLabel')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-6 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 text-lg transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="Cleaning">{t('pages.serviceRequest.typeCleaning')}</option>
                <option value="Maintenance">{t('pages.serviceRequest.typeMaintenance')}</option>
                <option value="Food & Drink">{t('pages.serviceRequest.typeFoodDrink')}</option>
                <option value="Other">{t('pages.serviceRequest.typeOther')}</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                {t('pages.serviceRequest.detailsLabel')}
              </label>
              <textarea
                placeholder={t('pages.serviceRequest.detailsPlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-6 py-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 text-lg transition-all duration-300 resize-y min-h-[120px]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-semibold py-4 px-6 transition-all duration-300 ease-in-out shadow-lg shadow-emerald-900/30 text-lg"
            >
              {loading ? t('pages.serviceRequest.sending') : t('pages.serviceRequest.submitButton')}
            </button>
          </form>

          {/* Feedback Messages */}
          {feedback && (
            <div
              className={`mt-6 rounded-xl border px-4 py-3 text-center font-medium text-base ${
                feedback.includes("successfully")
                  ? "border-emerald-900/60 bg-emerald-950/40 text-emerald-100"
                  : "border-red-900/60 bg-red-950/50 text-red-200"
              }`}
            >
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
