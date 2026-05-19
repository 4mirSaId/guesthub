import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/authToken';

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      role: user.role,
      username: user.username,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Invalid token' }, { status: 401 });
  }
}
