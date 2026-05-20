'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="sticky bottom-0 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 shadow-sm py-6 sm:py-8 md:py-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 text-white">Adress</h3>
            <p className="text-xs sm:text-sm text-slate-400">Rue de l&apos;Aéroport, Skanes</p>
            <p className="text-xs sm:text-sm text-slate-400">Monastir 5000, Tunisie</p>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 text-white">Téléphone</h3>
            <p className="text-xs sm:text-sm text-slate-400">+216 73 **** ****</p>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 text-white">Email</h3>
            <p className="text-xs sm:text-sm text-slate-400">hotel@hotel.com</p>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-2 text-white">Website</h3>
            <a href="https://hotelname.tn" className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-300">rosabeach.tn</a>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs sm:text-sm text-slate-500">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;