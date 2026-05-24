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
    { href: '/', label: 'navbar.home' },
    { href: '/activities', label: 'navbar.activities' },
    { href: '/night-shows', label: 'navbar.nightShows' },
    { href: '/request', label: 'navbar.songRequest' },
    { href: '/service', label: 'navbar.serviceRequest' },
    { href: '/complaints', label: 'navbar.complaints' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity duration-300 flex-shrink-0">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10">
              <Image
                src="/HR-logo.jpg"
                alt="HR GuestHub Logo"
                fill
                sizes="(max-width: 768px) 32px, 40px"
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-white">HR GuestHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2 lg:space-x-8 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 lg:px-4 py-2 rounded-xl font-medium text-sm lg:text-base transition-all duration-300 ease-in-out ${
                  pathname === item.href
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {t(item.label)}
              </Link>
            ))}
            
            {/* Language Selector - Desktop */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="px-3 lg:px-4 py-2 rounded-xl font-medium text-sm lg:text-base text-slate-300 hover:text-white hover:bg-slate-900/60 transition-all duration-300 ease-in-out flex items-center space-x-2"
                aria-label={t('navbar.language')}
              >
                <span>🌐</span>
                <span>{language.toUpperCase()}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-slate-900 rounded-lg shadow-lg border border-slate-800 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        language === lang.code
                          ? 'bg-emerald-500 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
            className="md:hidden p-2 rounded-lg hover:bg-slate-900/60 transition-colors duration-300"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6 text-white"
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
          <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium text-base transition-all duration-300 ease-in-out ${
                    pathname === item.href
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {t(item.label)}
                </Link>
              ))}
              
              {/* Language Selector - Mobile */}
              <div className="border-t border-slate-800 mt-2 pt-2">
                <div className="text-xs text-slate-400 px-4 py-2">{t('navbar.language')}</div>
                <div className="flex gap-2 px-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsMenuOpen(false);
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        language === lang.code
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
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