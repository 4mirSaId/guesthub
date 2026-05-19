import { NextResponse } from 'next/server';
import SpecialEvent from '@models/SpecialEvent';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    const events = await SpecialEvent.find().sort({ createdAt: -1 });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const { eventName, time, location, moreInfo } = await request.json();

    if (!eventName || !eventName.trim() || !time || !time.trim() || !location || !location.trim()) {
      return NextResponse.json(
        { error: 'Event name, time, and location are required.' },
        { status: 400 }
      );
    }

    const savedEvent = await new SpecialEvent({
      eventName: eventName.trim(),
      time: time.trim(),
      location: location.trim(),
      moreInfo: moreInfo ? moreInfo.trim() : '',
    }).save();

    return NextResponse.json(savedEvent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
