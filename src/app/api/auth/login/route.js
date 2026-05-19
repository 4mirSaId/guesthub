import { NextResponse } from 'next/server';
import { USERS } from '@/lib/authUsers';
import { createToken } from '@/lib/authToken';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const user = USERS[username];
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      token: createToken(username),
      role: user.role,
      username,
      message: 'Login successful',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
