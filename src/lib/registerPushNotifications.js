import { getApiBase } from './apiBase';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushNotifications(role, token) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' };
  }

  const permissionKey = `pushPermissionAsked_${role}`;
  const storedPermission = localStorage.getItem(permissionKey);
  if (storedPermission === 'denied') {
    return { ok: false, reason: 'denied' };
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    const apiBase = getApiBase();
    const keyRes = await fetch(`${apiBase}/api/push/vapid-public-key`);
    if (!keyRes.ok) {
      return { ok: false, reason: 'not-configured' };
    }

    const { publicKey } = await keyRes.json();

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      localStorage.setItem(permissionKey, permission);
      if (permission !== 'granted') {
        return { ok: false, reason: permission };
      }
    } else if (Notification.permission === 'denied') {
      localStorage.setItem(permissionKey, 'denied');
      return { ok: false, reason: 'denied' };
    }

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const subRes = await fetch(`${apiBase}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    });

    if (!subRes.ok) {
      return { ok: false, reason: 'subscribe-failed' };
    }

    localStorage.setItem(permissionKey, 'granted');
    return { ok: true };
  } catch (error) {
    console.error('Push registration failed:', error);
    return { ok: false, reason: 'error' };
  }
}
