'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const pathname = usePathname();
  const { language, changeLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const navItems = [
    { href: '/activities', label: 'navbar.activities' },
    { href: '/night-shows', label: 'navbar.nightShows' },
    { href: '/service', label: 'navbar.serviceRequest' },
    { href: '/complaints', label: 'navbar.complaints' },
    { href: '/feedback', label: 'navbar.feedback' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-[var(--navy-deep)] bg-[var(--sand)] shadow-[0_4px_14px_rgba(9,43,62,0.08)]">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 md:px-8">
        <div className="relative flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-shrink-0 items-center transition-opacity duration-200 hover:opacity-80">
            <div className="relative h-9 w-28 sm:h-10 sm:w-36">
              <Image
                src="/hammamet-beach-logo-transparent.png"
                alt="Hammamet Beach"
                fill
                sizes="(max-width: 768px) 128px, 160px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 md:flex lg:gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md border px-4 py-2 text-sm font-semibold transition-colors duration-200 lg:px-5 lg:py-2.5 lg:text-base ${
                  pathname === item.href
                    ? 'border-[var(--navy)] bg-[var(--navy)] text-white'
                    : 'border-transparent text-[var(--ink-soft)] hover:border-[var(--line)] hover:bg-[var(--sand-dark)] hover:text-[var(--navy)]'
                }`}
              >
                {t(item.label)}
              </Link>
            ))}
            
            {/* Language Selector - Desktop */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 whitespace-nowrap rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] transition-colors duration-200 hover:border-[var(--line)] hover:bg-[var(--sand-dark)] hover:text-[var(--navy)] lg:px-5 lg:py-2.5 lg:text-base"
                aria-label={t('navbar.language')}
              >
                <span>{language.toUpperCase()}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-md border border-[var(--line)] bg-[var(--sand)] py-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors duration-200 first:rounded-t-md last:rounded-b-md ${
                        language === lang.code
                          ? 'bg-[var(--navy)] font-semibold text-white'
                          : 'text-[var(--ink-soft)] hover:bg-[var(--sand-dark)] hover:text-[var(--navy)]'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-md border border-[var(--navy)] p-2 text-[var(--navy)] transition-colors duration-200 hover:bg-[var(--sand-dark)] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="h-6 w-6 text-[var(--navy)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="mt-3 border-t border-[var(--line)] pb-2 pt-3 md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-md border px-4 py-2.5 text-base font-semibold transition-colors duration-200 ${
                    pathname === item.href
                      ? 'border-[var(--navy)] bg-[var(--navy)] text-white'
                      : 'border-transparent text-[var(--ink-soft)] hover:border-[var(--line)] hover:bg-[var(--sand-dark)] hover:text-[var(--navy)]'
                  }`}
                >
                  {t(item.label)}
                </Link>
              ))}
              
              {/* Language Selector - Mobile */}
              <div className="mt-2 border-t border-[var(--line)] pt-2">
                <div className="px-4 py-2 text-xs text-[var(--ink-soft)]">{t('navbar.language')}</div>
                <div className="flex gap-2 px-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsMenuOpen(false);
                      }}
                      className={`flex-1 rounded-md border px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                        language === lang.code
                          ? 'border-[var(--navy)] bg-[var(--navy)] text-white'
                            : 'border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--sand-dark)] hover:text-[var(--navy)]'
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}