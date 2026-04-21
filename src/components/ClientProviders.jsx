'use client';

import AnnouncementBar from './AnnouncementBar';

export default function ClientProviders({ children }) {
  return (
    <>
      <AnnouncementBar />
      {children}
    </>
  );
}
