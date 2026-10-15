'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import AnnouncementBar from './AnnouncementBar';

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
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t px-4 py-2 shadow-[0_-8px_24px_rgba(9,43,62,0.08)] md:hidden" aria-label="Guest navigation">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {[
            { href: '/', icon: '⌂', label: 'Home' },
            { href: '/complaints', icon: '!', label: 'Complaints' },
            { href: '/service', icon: '♧', label: 'Requests' },
            { href: '/feedback', icon: '✦', label: 'Feedback' },
          ].map((item) => (
            <a key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-[10px] font-semibold tracking-wide text-inherit transition hover:text-[var(--coral)]">
              <span className="text-lg leading-5">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
