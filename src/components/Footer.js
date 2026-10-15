'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="site-footer border-t border-[var(--line)] bg-[var(--sand-dark)]/40 py-8 text-[var(--ink)] sm:py-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold sm:text-base">{t('footer.address')}</h3>
            <p className="text-xs text-[var(--ink-soft)] sm:text-sm">City, Gouvernorat, Country</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold sm:text-base">{t('footer.phone')}</h3>
            <p className="text-xs text-[var(--ink-soft)] sm:text-sm">+216 72******</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold sm:text-base">{t('footer.email')}</h3>
            <p className="text-xs text-[var(--ink-soft)] sm:text-sm">mail@mail.mail</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold sm:text-base">{t('footer.website')}</h3>
            <a href="https://official-website.com" className="text-xs text-[var(--teal)] transition-colors duration-300 hover:text-[var(--navy)] sm:text-sm">official-website.com</a>
          </div>
        </div>
        <div className="mt-4 border-t border-[var(--line)] pt-4 text-center">
          <p className="text-xs text-[var(--ink-soft)] sm:text-sm">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;