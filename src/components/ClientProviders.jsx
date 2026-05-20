'use client';

import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import { LanguageProvider } from '../context/LanguageContext';

export default function ClientProviders({ children }) {
  const pathname = usePathname();
  const isStaffRoute = pathname?.startsWith('/admin');

  return (
    <LanguageProvider>
      {!isStaffRoute && <AnnouncementBar />}
      {children}
    </LanguageProvider>
  );
}
