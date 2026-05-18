'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminServicesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/guestrelation');
  }, [router]);

  return null;
}
