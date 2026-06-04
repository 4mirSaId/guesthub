import { NextResponse } from 'next/server';
import Announcement from '@models/Announcement';
import { connectToDatabase } from '@/lib/mongodb';

async function getLatestActiveAnnouncement() {
  return Announcement.findOne({ active: true }).sort({ createdAt: -1 });
}

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { message, priority, icon, active, autoHideSeconds } = await request.json();

    const updateData = {
      updatedAt: new Date(),
    };

    if (message !== undefined) updateData.message = message;
    if (priority !== undefined) updateData.priority = priority;
    if (icon !== undefined) updateData.icon = icon;
    if (autoHideSeconds !== undefined) updateData.autoHideSeconds = autoHideSeconds;

    const { id } = await params;

    if (active === true) {
      await Announcement.updateMany(
        { _id: { $ne: id }, active: true },
        { active: false }
      );
      updateData.active = true;
    } else if (active === false) {
      updateData.active = false;
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after' }
    );

    if (!updatedAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    await getLatestActiveAnnouncement();
    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Announcement deleted', deletedAnnouncement });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
