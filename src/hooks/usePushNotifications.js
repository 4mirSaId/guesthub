'use client';

import { useEffect } from 'react';
import { registerPushNotifications } from '@/lib/registerPushNotifications';

export function usePushNotifications({ enabled, role, tokenKey }) {
  useEffect(() => {
    if (!enabled) return;

    const token = localStorage.getItem(tokenKey);
    if (!token) return;

    registerPushNotifications(role, token);
  }, [enabled, role, tokenKey]);
}
