/**
 * Express API origin. Set NEXT_PUBLIC_API_URL in .env (no trailing slash), e.g. http://localhost:3001
 */
export function getApiBase() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim().replace(/\/$/, '');
  }
  return 'http://localhost:3001';
}
