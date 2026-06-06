const LOCAL_SOCKET_BASE = 'http://localhost:3001';

export function getSocketBase() {
  const raw = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_SOCKET_BASE;
    }
    // For production (Vercel, etc.), use the same domain
    return window.location.origin;
  }

  return null;
}
