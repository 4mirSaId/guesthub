import { NextResponse } from 'next/server';
import SpecialEvent from '@models/SpecialEvent';
import { connectToDatabase } from '@/lib/mongodb';

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { eventName, time, location, moreInfo } = await request.json();

    const updateData = {};
    if (eventName !== undefined) updateData.eventName = eventName.trim();
    if (time !== undefined) updateData.time = time.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (moreInfo !== undefined) updateData.moreInfo = moreInfo ? moreInfo.trim() : '';

    const updatedEvent = await SpecialEvent.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    await connectToDatabase();
    const deletedEvent = await SpecialEvent.findByIdAndDelete(params.id);

    if (!deletedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
