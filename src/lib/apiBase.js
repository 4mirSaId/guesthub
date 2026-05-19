const LOCAL_API_BASE = 'http://localhost:3001';

/**
 * Resolve the API origin.
 * - `NEXT_PUBLIC_API_URL` wins when explicitly set.
 * - In the browser on production/staging domains, use the current origin.
 * - In local development, fall back to the Express server on :3001.
 */
export function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return origin.replace(/\/$/, '');
    }
  }

  return LOCAL_API_BASE;
}
