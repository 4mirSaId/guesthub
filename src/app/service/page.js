"use client";

import { useState } from "react";
import axios from "axios";

export default function ServicePage() {
  const [room, setRoom] = useState("");
  const [type, setType] = useState("Cleaning");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async () => {
    if (!room) {
      setFeedback("Room number is required");
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
      setFeedback("Request sent successfully ✅");
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      console.error("Error submitting service request:", error);
      setFeedback("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-emerald-400 mb-3">Service Request</h1>
          <p className="text-slate-400 text-lg">Submit a service request for your room</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-black/30">
          <form className="space-y-6">
            {/* Room Number */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                Room Number *
              </label>
              <input
                type="text"
                placeholder="Enter your room number"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-6 py-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 text-lg transition-all duration-300"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                Service Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-6 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 focus:border-emerald-500 text-lg transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="Cleaning">🧹 Cleaning</option>
                <option value="Maintenance">🔧 Maintenance</option>
                <option value="Food & Drink">🍽️ Food & Drink</option>
                <option value="Other">📋 Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                Additional Details (Optional)
              </label>
              <textarea
                placeholder="Describe your service request in detail..."
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
              {loading ? "Submitting..." : "Submit Request 🛎️"}
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
