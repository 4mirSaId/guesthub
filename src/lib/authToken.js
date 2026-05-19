import { USERS } from '@/lib/authUsers';

export function createToken(username) {
  return Buffer.from(`${username}:${Date.now()}`).toString('base64');
}

export function decodeToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const username = decoded.split(':')[0];
    if (!USERS[username]) return null;

    return {
      username,
      role: USERS[username].role,
    };
  } catch {
    return null;
  }
}

export function getBearerToken(request) {
  return request.headers.get('authorization')?.replace('Bearer ', '') || null;
}

export function getAuthUser(request) {
  const token = getBearerToken(request);
  if (!token) return null;
  return decodeToken(token);
}
