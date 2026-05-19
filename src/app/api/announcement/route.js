import { NextResponse } from 'next/server';
import Announcement from '@models/Announcement';
import { connectToDatabase } from '@/lib/mongodb';

async function getLatestActiveAnnouncement() {
  return Announcement.findOne({ active: true }).sort({ createdAt: -1 });
}

export async function GET() {
  try {
    await connectToDatabase();
    const announcement = await getLatestActiveAnnouncement();
    return NextResponse.json(announcement || null);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const { message, priority = 'warning', icon = 'âš ï¸', autoHideSeconds = null } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await Announcement.updateMany({ active: true }, { active: false });

    const newAnnouncement = await new Announcement({
      message,
      active: true,
      priority,
      icon,
      autoHideSeconds,
    }).save();

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
