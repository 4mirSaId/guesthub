"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function timeToMinutes(value) {
  if (!value || typeof value !== 'string') return null;

  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;

  return hours * 60 + minutes;
}

function isToday(value) {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function getHomeStatus(program, settings, events) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const activities = (program?.activities || [])
    .map((activity) => ({ ...activity, minutes: timeToMinutes(activity.time) }))
    .filter((activity) => Number.isInteger(activity.minutes))
    .sort((a, b) => a.minutes - b.minutes);
  const activity = activities.find((item) => item.minutes >= currentMinutes) || activities[0] || null;

  const week = settings?.currentWeek === 'B' ? program?.nightShows?.weekB : program?.nightShows?.weekA;
  const nightShow = (week || []).find((item) => item.day === DAY_NAMES[now.getDay()]);
  const specialEvent = (events || []).find((event) => isToday(event.createdAt));

  return { activity, nightShow, specialEvent };
}

const featureCards = [
  {
    href: '/activities',
    icon: '01',
    iconBg: 'bg-emerald-500/15 text-emerald-300',
    titleKey: 'navbar.activities',
    descriptionKey: 'pages.home.activitiesDesc',
    accent: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
  },
  {
    href: '/night-shows',
    icon: '02',
    iconBg: 'bg-violet-500/15 text-violet-300',
    titleKey: 'navbar.nightShows',
    descriptionKey: 'pages.home.nightShowsDesc',
    accent: 'from-violet-500/20 via-violet-400/10 to-transparent',
  },
  {
    href: '/service',
    icon: '03',
    iconBg: 'bg-sky-500/15 text-sky-300',
    titleKey: 'navbar.serviceRequest',
    descriptionKey: 'pages.home.serviceRequestDesc',
    accent: 'from-sky-500/20 via-sky-400/10 to-transparent',
  },
  {
    href: '/complaints',
    icon: '04',
    iconBg: 'bg-rose-500/15 text-rose-300',
    titleKey: 'navbar.complaints',
    descriptionKey: 'pages.home.complaintsDesc',
    accent: 'from-rose-500/20 via-rose-400/10 to-transparent',
  },
  {
    href: '/feedback',
    icon: '05',
    iconBg: 'bg-cyan-500/15 text-cyan-300',
    titleKey: 'pages.home.reviewsFeedback',
    descriptionKey: 'pages.guestReviews.description',
    accent: 'from-cyan-500/20 via-cyan-400/10 to-transparent',
  },
];

export default function Home() {
  const { t } = useLanguage();
  const [status, setStatus] = useState({ activity: null, nightShow: null, specialEvent: null });

  useEffect(() => {
    let active = true;

    const loadStatus = async () => {
      try {
        const [programResponse, settingsResponse, eventsResponse] = await Promise.all([
          fetch('/api/program'),
          fetch('/api/settings'),
          fetch('/api/events'),
        ]);

        if (!programResponse.ok || !settingsResponse.ok || !eventsResponse.ok) {
          throw new Error('Failed to load home status');
        }

        const [program, settings, events] = await Promise.all([
          programResponse.json(),
          settingsResponse.json(),
          eventsResponse.json(),
        ]);

        if (active) setStatus(getHomeStatus(program, settings, events));
      } catch {
        if (active) setStatus({ activity: null, nightShow: null, specialEvent: null });
      }
    };

    loadStatus();
    const interval = setInterval(loadStatus, 60_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="home-page min-h-screen px-4 pb-12 pt-12 sm:px-6 md:px-8 md:pt-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 sm:mb-7">
          <h1 className="text-3xl font-semibold text-[var(--navy-deep)] sm:text-4xl">
            {t('pages.home.appFeaturesTitle') || 'What would you like to do?'}
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)] sm:text-base">
            {t('pages.home.appFeaturesSubtitle') || 'Pick the experience you want and keep your stay effortless.'}
          </p>
        </header>

        <section className="mb-6 grid overflow-hidden rounded-2xl border border-[var(--line)] bg-white/55 shadow-[0_8px_18px_rgba(9,43,62,0.06)] sm:grid-cols-3" aria-label={t('pages.home.todayOverview')}>
          <div className="border-b border-[var(--line)] px-4 py-4 sm:border-b-0 sm:border-r sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">{t('pages.home.currentActivity')}</p>
            <p className="mt-2 truncate text-base font-semibold text-[var(--navy-deep)]">
              {status.activity?.name || t('pages.home.noActivity')}
            </p>
            {status.activity?.time && <p className="mt-1 text-xs text-[var(--ink-soft)]">{status.activity.time}</p>}
          </div>
          <div className="border-b border-[var(--line)] px-4 py-4 sm:border-b-0 sm:border-r sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--coral)]">{t('pages.home.tonightShow')}</p>
            <p className="mt-2 truncate text-base font-semibold text-[var(--navy-deep)]">
              {status.nightShow?.show || t('pages.home.noShow')}
            </p>
          </div>
          <div className="px-4 py-4 sm:px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">{t('pages.home.specialEventToday')}</p>
            <p className="mt-2 truncate text-base font-semibold text-[var(--navy-deep)]">
              {status.specialEvent?.eventName || t('pages.home.noSpecialEvent')}
            </p>
            {status.specialEvent?.time && <p className="mt-1 text-xs text-[var(--ink-soft)]">{status.specialEvent.time} · {status.specialEvent.location}</p>}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={`action-tile group relative min-h-[178px] overflow-hidden rounded-[20px] p-6 shadow-[0_10px_20px_rgba(9,43,62,0.12)] transition-transform duration-300 hover:-translate-y-1 ${feature.accent}`}
            >
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.iconBg} text-xl`}>
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/80">
                    {t('common.open')}
                  </span>
                </div>
                <h2 className="mt-auto pt-5 text-xl font-semibold text-white">{t(feature.titleKey)}</h2>
                <p className="mt-1 text-sm leading-relaxed text-white/80">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
