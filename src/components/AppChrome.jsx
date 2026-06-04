'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import AnnouncementBar from './AnnouncementBar';
import Footer from './Footer';

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const isStaffRoute = pathname?.startsWith('/admin');

  if (isStaffRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <AnnouncementBar />
      {children}
      <Footer />
    </>
  );
}
