'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginRedirect() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check for animation login
      const animationToken = localStorage.getItem('animationToken');
      if (animationToken) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${animationToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.role === 'animation') {
              router.replace('/admin/animation');
              return;
            }
          }
        } catch (error) {
          console.error('Animation auth check failed:', error);
        }
      }

      // Check for guest relation login
      const grToken = localStorage.getItem('grToken');
      if (grToken) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${grToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.role === 'guestrelation') {
              router.replace('/admin/guestrelation');
              return;
            }
          }
        } catch (error) {
          console.error('Guest relation auth check failed:', error);
        }
      }

      // No valid auth found, redirect to portal
      router.replace('/admin');
    };

    checkAuth();
  }, [router]);

  return null;
}
