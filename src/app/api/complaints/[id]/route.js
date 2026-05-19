import { NextResponse } from 'next/server';
import Complaint from '@models/Complaint';
import { connectToDatabase } from '@/lib/mongodb';

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { status } = await request.json();

    if (!['pending', 'reviewed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!updatedComplaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json(updatedComplaint);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
