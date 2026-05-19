import { NextResponse } from 'next/server';
import AdminUser from '@models/AdminUser';
import { ensureStaffUsersSeeded } from '@/lib/authUsers';
import { createToken } from '@/lib/authToken';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyPassword } from '@/lib/passwordHash';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    await connectToDatabase();
    await ensureStaffUsersSeeded();

    const normalizedUsername = String(username).trim().toLowerCase();
    const user = await AdminUser.findOne({
      username: normalizedUsername,
      active: true,
    }).lean();

    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      token: createToken(user.username),
      role: user.role,
      username: user.username,
      message: 'Login successful',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
