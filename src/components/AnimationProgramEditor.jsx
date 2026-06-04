'use client';

import { useState, useEffect } from 'react';

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80';

const btnPrimary =
  'rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold px-6 py-3 transition-colors';
const btnDanger =
  'rounded-xl bg-red-500/90 hover:bg-red-600 text-white font-medium px-4 py-2 text-sm transition-colors';
const btnGhost =
  'rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium px-4 py-2 text-sm transition-colors';

export default function AnimationProgramEditor({ section, settings, onSettingsChange, onSaveSettings }) {
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadProgram = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/program');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (active) setProgram(data);
      } catch {
        if (active) setMessage('Could not load program data.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProgram();

    return () => {
      active = false;
    };
  }, []);

  const saveProgram = async (nextProgram) => {
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('animationToken');
      const res = await fetch('http://localhost:3001/api/program', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nextProgram),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setProgram(data);
      setMessage('Saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const update = (patch) => {
    setProgram((prev) => ({ ...prev, ...patch }));
  };

  if (loading) {
    return <p className="text-slate-400 py-8">Loading program…</p>;
  }

  if (!program) {
    return <p className="text-red-300 py-8">{message || 'Program unavailable.'}</p>;
  }

  if (section === 'activities') {
    return (
      <ActivitiesEditor
        program={program}
        update={update}
        saveProgram={saveProgram}
        saving={saving}
        message={message}
      />
    );
  }

  if (section === 'nightShows') {
    return (
      <NightShowsEditor
        program={program}
        update={update}
        saveProgram={saveProgram}
        saving={saving}
        message={message}
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSaveSettings={onSaveSettings}
      />
    );
  }

  if (section === 'kidsClub') {
    return (
      <KidsClubEditor
        program={program}
        update={update}
        saveProgram={saveProgram}
        saving={saving}
        message={message}
      />
    );
  }

  return null;
}

function SaveBar({ onSave, saving, message }) {
  return (
    <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-slate-800">
      <button type="button" onClick={onSave} disabled={saving} className={btnPrimary}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
      {message && (
        <span className={`text-sm font-medium ${message.includes('success') ? 'text-emerald-400' : 'text-red-300'}`}>
          {message}
        </span>
      )}
    </div>
  );
}

function ActivitiesEditor({ program, update, saveProgram, saving, message }) {
  const activities = program.activities || [];

  const setActivities = (next) => update({ activities: next });

  const add = () => {
    setActivities([...activities, { time: '09:00', name: 'New activity', order: activities.length }]);
  };

  const remove = (index) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const change = (index, field, value) => {
    setActivities(activities.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Daily Activities</h2>
      <p className="text-slate-400 mb-8">Edit times and names shown on the Activities page.</p>

      <div className="space-y-4">
        {activities.map((act, index) => (
          <div
            key={act._id || index}
            className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900"
          >
            <div className="sm:w-32">
              <label className="block text-xs text-slate-500 mb-1 uppercase">Time</label>
              <input
                type="time"
                value={act.time}
                onChange={(e) => change(index, 'time', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1 uppercase">Activity</label>
              <input
                type="text"
                value={act.name}
                onChange={(e) => change(index, 'name', e.target.value)}
                className={inputClass}
                placeholder="Activity name"
              />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={() => remove(index)} className={btnDanger}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={add} className={`${btnGhost} mt-4`}>
        + Add activity
      </button>

      <SaveBar onSave={() => saveProgram(program)} saving={saving} message={message} />
    </div>
  );
}

function NightShowsEditor({ program, update, saveProgram, saving, message, settings, onSettingsChange, onSaveSettings }) {
  const [weekTab, setWeekTab] = useState('weekA');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const items = program.nightShows?.[weekTab] || [];

  const setWeekItems = (week, next) => {
    update({
      nightShows: {
        ...program.nightShows,
        [week]: next,
      },
    });
  };

  const change = (index, field, value) => {
    setWeekItems(
      weekTab,
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const add = () => {
    setWeekItems(weekTab, [...items, { day: 'Monday', show: 'New Show', emoji: '', order: items.length }]);
  };

  const remove = (index) => {
    setWeekItems(
      weekTab,
      items.filter((_, i) => i !== index)
    );
  };

  const handleSaveSettings = async () => {
    if (onSaveSettings) {
      setSettingsSaving(true);
      setSettingsMessage('');
      try {
        await onSaveSettings();
        setSettingsMessage('Settings saved successfully!');
        setTimeout(() => setSettingsMessage(''), 3000);
      } catch (error) {
        setSettingsMessage('Failed to save settings');
      } finally {
        setSettingsSaving(false);
      }
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Night Shows</h2>
      <p className="text-slate-400 mb-8">Manage Week A and Week B programs.</p>

      {/* Current Week for Tonight's Show */}
      {settings && onSettingsChange && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 mb-8">
          <label className="block text-lg font-semibold mb-4 text-white">Current Week for Tonight&apos;s Show</label>
          <div className="flex gap-6 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="currentWeek"
                value="A"
                checked={settings.currentWeek === 'A'}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  currentWeek: e.target.value
                })}
                className="mr-3"
              />
              <span className="text-lg text-slate-100">Week A</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="currentWeek"
                value="B"
                checked={settings.currentWeek === 'B'}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  currentWeek: e.target.value
                })}
                className="mr-3"
              />
              <span className="text-lg text-slate-100">Week B</span>
            </label>
          </div>
          <p className="text-sm text-slate-400 mb-4">Switch between Week A and Week B programs for the nightly entertainment schedule.</p>
          {onSaveSettings && (
            <button
              onClick={handleSaveSettings}
              disabled={settingsSaving}
              className="px-4 py-2 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60"
            >
              {settingsSaving ? 'Saving...' : 'Save Current Week'}
            </button>
          )}
          {settingsMessage && (
            <p className="text-sm font-semibold mt-2">{settingsMessage}</p>
          )}
        </div>
      )}

      <div className="flex gap-3 mb-6">
        {['weekA', 'weekB'].map((week) => (
          <button
            key={week}
            type="button"
            onClick={() => setWeekTab(week)}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              weekTab === week ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {week === 'weekA' ? 'Week A' : 'Week B'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item._id || index}
            className="grid gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900 sm:grid-cols-[7rem_1fr_5rem_auto]"
          >
            <div>
              <label className="block text-xs text-slate-500 mb-1 uppercase">Day</label>
              <input
                type="text"
                value={item.day}
                onChange={(e) => change(index, 'day', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1 uppercase">Show</label>
              <input
                type="text"
                value={item.show}
                onChange={(e) => change(index, 'show', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1 uppercase">Emoji</label>
              <input
                type="text"
                value={item.emoji}
                onChange={(e) => change(index, 'emoji', e.target.value)}
                className={`${inputClass} text-center text-2xl`}
              />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={() => remove(index)} className={btnDanger}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={add} className={`${btnGhost} mt-4`}>
        + Add show
      </button>

      <SaveBar onSave={() => saveProgram(program)} saving={saving} message={message} />
    </div>
  );
}

function KidsClubEditor({ program, update, saveProgram, saving, message }) {
  const days = program.kidsClub || [];

  const setDays = (next) => update({ kidsClub: next });

  const addDay = () => {
    setDays([
      ...days,
      {
        day: 'New Day',
        order: days.length,
        sessions: [
          { label: 'Morning', startTime: '10:00', endTime: '12:00' },
          { label: 'Afternoon', startTime: '15:00', endTime: '17:00' },
        ],
      },
    ]);
  };

  const removeDay = (dayIndex) => {
    setDays(days.filter((_, i) => i !== dayIndex));
  };

  const changeDay = (dayIndex, value) => {
    setDays(days.map((d, i) => (i === dayIndex ? { ...d, day: value } : d)));
  };

  const changeSession = (dayIndex, sessionIndex, field, value) => {
    setDays(
      days.map((d, i) => {
        if (i !== dayIndex) return d;
        return {
          ...d,
          sessions: d.sessions.map((s, j) => (j === sessionIndex ? { ...s, [field]: value } : s)),
        };
      })
    );
  };

  const addSession = (dayIndex) => {
    setDays(
      days.map((d, i) => {
        if (i !== dayIndex) return d;
        return {
          ...d,
          sessions: [...d.sessions, { label: 'Session', startTime: '10:00', endTime: '12:00' }],
        };
      })
    );
  };

  const removeSession = (dayIndex, sessionIndex) => {
    setDays(
      days.map((d, i) => {
        if (i !== dayIndex) return d;
        const sessions = d.sessions.filter((_, j) => j !== sessionIndex);
        return { ...d, sessions };
      })
    );
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Kids Club Schedule</h2>
      <p className="text-slate-400 mb-8">Edit days and session times (24h format, e.g. 10:00, 15:00).</p>

      <div className="space-y-6">
        {days.map((dayItem, dayIndex) => (
          <div key={dayItem._id || dayIndex} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1 uppercase">Day</label>
                <input
                  type="text"
                  value={dayItem.day}
                  onChange={(e) => changeDay(dayIndex, e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex items-end gap-2">
                <button type="button" onClick={() => addSession(dayIndex)} className={btnGhost}>
                  + Session
                </button>
                <button type="button" onClick={() => removeDay(dayIndex)} className={btnDanger}>
                  Remove day
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {(dayItem.sessions || []).map((session, sessionIndex) => (
                <div
                  key={session._id || sessionIndex}
                  className="grid gap-3 p-4 rounded-lg bg-slate-950 border border-slate-800 sm:grid-cols-[1fr_6rem_6rem_auto]"
                >
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Label</label>
                    <input
                      type="text"
                      value={session.label}
                      onChange={(e) => changeSession(dayIndex, sessionIndex, 'label', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Start</label>
                    <input
                      type="time"
                      value={session.startTime}
                      onChange={(e) => changeSession(dayIndex, sessionIndex, 'startTime', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">End</label>
                    <input
                      type="time"
                      value={session.endTime}
                      onChange={(e) => changeSession(dayIndex, sessionIndex, 'endTime', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeSession(dayIndex, sessionIndex)}
                      className={btnDanger}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addDay} className={`${btnGhost} mt-4`}>
        + Add day
      </button>

      <SaveBar onSave={() => saveProgram(program)} saving={saving} message={message} />
    </div>
  );
}
