import { NextResponse } from 'next/server';
import Announcement from '@models/Announcement';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    return NextResponse.json(announcements);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
