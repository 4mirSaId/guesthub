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
      await axios.post("http://localhost:3001/api/service-requests", {
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-emerald-500 mb-3">Service Request</h1>
          <p className="text-gray-600 text-lg">Submit a service request for your room</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <form className="space-y-6">
            {/* Room Number */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Room Number *
              </label>
              <input
                type="text"
                placeholder="Enter your room number"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 text-lg transition-all duration-300"
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Service Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 text-lg transition-all duration-300 appearance-none cursor-pointer bg-white"
              >
                <option value="Cleaning">🧹 Cleaning</option>
                <option value="Maintenance">🔧 Maintenance</option>
                <option value="Food & Drink">🍽️ Food & Drink</option>
                <option value="Other">📋 Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                Additional Details (Optional)
              </label>
              <textarea
                placeholder="Describe your service request in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 text-lg transition-all duration-300 resize-none h-28"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 ease-in-out shadow-md hover:shadow-lg text-lg"
            >
              {loading ? "Submitting..." : "Submit Request 🛎️"}
            </button>
          </form>

          {/* Feedback Messages */}
          {feedback && (
            <div
              className={`mt-6 p-4 rounded-xl text-center font-medium text-lg ${
                feedback.includes("successfully")
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
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