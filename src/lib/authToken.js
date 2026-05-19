import AdminUser from '@models/AdminUser';
import { connectToDatabase } from '@/lib/mongodb';
import { ensureStaffUsersSeeded } from '@/lib/authUsers';

export function createToken(username) {
  return Buffer.from(`${username}:${Date.now()}`).toString('base64');
}

export function decodeToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const username = decoded.split(':')[0];
    if (!username) return null;

    return {
      username,
    };
  } catch {
    return null;
  }
}

export function getBearerToken(request) {
  return request.headers.get('authorization')?.replace('Bearer ', '') || null;
}

export async function getAuthUser(request) {
  const token = getBearerToken(request);
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded?.username) return null;

  await connectToDatabase();
  await ensureStaffUsersSeeded();

  const user = await AdminUser.findOne({
    username: decoded.username.toLowerCase(),
    active: true,
  })
    .select('username role')
    .lean();

  if (!user) return null;

  return {
    username: user.username,
    role: user.role,
  };
}
