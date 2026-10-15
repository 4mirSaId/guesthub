'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const CATEGORY_OPTIONS = [
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'setup', label: 'Room Setup' },
  { value: 'assistance', label: 'Special Assistance' },
  { value: 'other', label: 'Other' },
];

const SERVICE_OPTIONS = {
  housekeeping: ['Extra towels', 'Extra pillows', 'Extra blanket', 'Room cleaning', 'Deep cleaning', 'Bed sheet replacement', 'Toiletries refill', 'Toilet paper refill', 'Trash removal', 'Laundry pickup'],
  food: ['Room service', 'Breakfast request', 'Drinks', 'Ice bucket', 'Coffee', 'Tea', 'Snacks'],
  maintenance: ['Air conditioning check', 'TV assistance', 'Wi-Fi assistance', 'Electrical issue', 'Plumbing assistance', 'Light bulb replacement', 'Safe assistance', 'Mini fridge issue'],
  setup: ['Romantic room setup', 'Birthday decoration', 'Honeymoon setup', 'Baby crib', 'Extra bed', 'Workspace setup'],
  assistance: ['Wheelchair', 'Accessibility assistance', 'Medical assistance', 'Childcare information'],
  other: ['Custom request'],
};

const PREFERRED_TIMES = ['ASAP', 'Within 30 minutes', 'Within 1 hour', 'Schedule a specific time'];
const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function ServiceRequestForm() {
  const [guestName, setGuestName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [category, setCategory] = useState('housekeeping');
  const [service, setService] = useState('Extra towels');
  const [description, setDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('ASAP');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState('info');

  const availableServices = useMemo(() => SERVICE_OPTIONS[category] || SERVICE_OPTIONS.other, [category]);

  useEffect(() => {
    if (!availableServices.includes(service)) {
      setService(availableServices[0]);
    }
  }, [availableServices, service]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!guestName.trim() || !roomNumber.trim()) {
      setFeedbackTone('error');
      setFeedback('Please provide your name and room number before submitting.');
      return;
    }

    setLoading(true);
    setFeedback('');

    try {
      await axios.post('/api/service-requests', {
        guestName: guestName.trim(),
        roomNumber: roomNumber.trim(),
        category,
        service,
        description: description.trim(),
        preferredTime,
        priority,
        status: 'pending',
      });

      setGuestName('');
      setRoomNumber('');
      setCategory('housekeeping');
      setService('Extra towels');
      setDescription('');
      setPreferredTime('ASAP');
      setPriority('normal');
      setFeedbackTone('success');
      setFeedback('Your service request has been created successfully.');
      setTimeout(() => setFeedback(''), 4000);
    } catch (error) {
      console.error('Error submitting service request:', error);
      setFeedbackTone('error');
      setFeedback('We could not submit your request right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guest-page px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
        <div className="lg:w-[38%]">
          <div className="guest-header rounded-[28px] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-light)]">Hotel concierge</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Premium service requests</h1>
            <p className="mt-4 text-base leading-7 text-white/70">Request housekeeping, food, maintenance, or special assistance in a single polished experience designed for modern hospitality teams.</p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">What you can request</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>• Housekeeping and room preparation</li>
                <li>• Food & beverage delivery</li>
                <li>• Maintenance and technical support</li>
                <li>• Special room setup and accessibility assistance</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:w-[62%]">
          <div className="guest-form-surface p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--ink)]">Guest name</label>
                  <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Enter guest name" className="guest-input px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Room number</label>
                  <input value={roomNumber} onChange={(event) => setRoomNumber(event.target.value)} placeholder="e.g. 305" className="guest-input px-4 py-3 text-sm" />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Service category</label>
                  <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-500">
                    {CATEGORY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Service</label>
                  <select value={service} onChange={(event) => setService(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-500">
                    {availableServices.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Request details</label>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Please tell us exactly what you need..." rows={6} className="min-h-[150px] w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-500" />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Preferred time</label>
                  <select value={preferredTime} onChange={(event) => setPreferredTime(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-500">
                    {PREFERRED_TIMES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Priority</label>
                  <select value={priority} onChange={(event) => setPriority(event.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-500">
                    {PRIORITY_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-400">
                Default status: <span className="font-semibold text-amber-300">Pending</span>
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Submitting request...' : 'Submit service request'}
              </button>
            </form>

            {feedback ? (
              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${feedbackTone === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-200'}`}>
                {feedback}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
