'use client';

import { LanguageProvider } from '../context/LanguageContext';

export default function ClientProviders({ children }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
