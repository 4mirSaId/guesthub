"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import TonightShow from '../components/TonightShow';
import GuestReviews from '../components/GuestReviews';
import SpecialEvents from '../components/SpecialEvents';

function Section({ title, subtitle, children, className = '' }) {
  return (
    <section className={`px-4 sm:px-6 md:px-8 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <div className="mb-8 sm:mb-10">
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function Button({ href, children, variant = 'primary', className = '' }) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:ring-offset-0';
  const styles = {
    primary:
      'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/30',
    ghost:
      'bg-slate-900/40 hover:bg-slate-900/70 text-slate-100 border border-slate-800',
  };

  return (
    <Link href={href} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}

function Card({ title, description, icon, href, cta, children }) {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20 transition-all duration-200 hover:bg-slate-900 hover:shadow-black/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-xl">
                {icon}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {title}
            </h3>
          </div>
          {description && (
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {children && <div className="mt-5">{children}</div>}

      {href && cta && (
        <div className="mt-6">
          <Button
            href={href}
            className="w-full sm:w-auto px-5 py-3 text-sm sm:text-base"
          >
            {cta}
          </Button>
        </div>
      )}
    </div>
  );
}

const sampleReviews = [
  { rating: 5, text: 'Clean rooms, friendly staff, and great vibes every night.' },
  { rating: 4, text: 'Activities are well organized. The app makes everything easy.' },
  { rating: 5, text: 'Loved the live DJ nights. Service requests were super quick.' },
];

function Stars({ value }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span className="text-amber-400 tracking-tight" aria-label={`${v} out of 5 stars`}>
      {'★'.repeat(v)}
      <span className="text-slate-600">{'★'.repeat(5 - v)}</span>
    </span>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const reviews = useMemo(() => sampleReviews, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/rosabeachpool.webp')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/75 to-slate-950" aria-hidden="true" />

        <div className="relative px-4 sm:px-6 md:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-slate-400">
                {t('pages.home.tagline')}
              </p>
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                {t('pages.home.welcome')}
              </h1>
              <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed">
                {t('pages.home.description')}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button href="/activities" className="px-6 py-3.5 text-sm sm:text-base">
                  {t('pages.home.exploreBtnText')}
                </Button>
                <Button href="/feedback" variant="ghost" className="px-6 py-3.5 text-sm sm:text-base">
                  {t('pages.home.feedbackBtnText')}
                </Button>
              </div>
            </div>

            <div className="mt-10 sm:mt-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  {/* TonightShow already styled to match the dark theme */}
                  <TonightShow />
                </div>
                <div className="lg:col-span-7">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 shadow-xl shadow-black/20">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {t('pages.home.stayOrganized')}
                    </h3>
                    <p className="mt-3 text-sm sm:text-base text-slate-400">
                      {t('pages.home.stayDescription')}
                    </p>
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Link className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 hover:border-slate-700 hover:bg-slate-950 transition-colors" href="/activities">
                        {t('navbar.activities')}
                      </Link>
                      <Link className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 hover:border-slate-700 hover:bg-slate-950 transition-colors" href="/night-shows">
                        {t('navbar.nightShows')}
                      </Link>
                      <Link className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 hover:border-slate-700 hover:bg-slate-950 transition-colors" href="/request">
                        {t('navbar.songRequest')}
                      </Link>
                      <Link className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 hover:border-slate-700 hover:bg-slate-950 transition-colors" href="/service">
                        {t('navbar.serviceRequest')}
                      </Link>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Link className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 hover:border-slate-700 hover:bg-slate-950 transition-colors" href="/complaints">
                        {t('navbar.complaints')}
                      </Link>
                      <Link className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 hover:border-slate-700 hover:bg-slate-950 transition-colors" href="/feedback">
                        {t('pages.home.reviewsFeedback')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* ACTIVITIES */}
      <Section className="py-10 sm:py-14" title={t('pages.home.whatYouCanDo')}>
        
          <Card
            icon="📅"
            title={t('pages.home.dailyActivities')}
            description={t('pages.home.activitiesDesc')}
            href="/activities"
            cta={t('pages.home.viewActivitiesBtn')}
          />
        
      </Section>

      <SpecialEvents />

      {/* SONG REQUEST */}
      <Section className="py-10 sm:py-14" title="Music requests">
        <Card
          icon="🎧"
          title="Request a Song"
          description="Ask the DJ for your favorite track and keep the vibe going."
          href="/request"
          cta="Ask for a Song"
        />
      </Section>

      {/* SERVICE REQUEST */}
      <Section className="py-10 sm:py-14" title="Services">
        <Card
          icon="🛎️"
          title="Need Something?"
          description="Request a service easily and get a quick response."
          href="/service"
          cta="Ask for a Service"
        />
      </Section>

      {/* COMPLAINTS */}
      <Section className="py-10 sm:py-14" title="Support">
        <Card
          icon="📝"
          title="Complaints"
          description="Report any issue quickly so we can help right away."
          href="/complaints"
          cta="Send Complaint"
        />
      </Section>

      

      {/* Existing live public reviews section (real API) */}
      <GuestReviews />

      {/* FOOTER */}
      <footer className="text-center py-8 sm:py-12 px-4 border-t border-slate-800 text-slate-500 bg-slate-950 text-sm sm:text-base">
        Enjoy your stay | DJ Amir
      </footer>

    </div>
  );
}
