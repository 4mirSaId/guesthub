import { NextResponse } from 'next/server';
import Complaint from '@models/Complaint';
import { connectToDatabase } from '@/lib/mongodb';

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { status } = await request.json();
    const { id } = await params;

    if (!['pending', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const existingComplaint = await Complaint.findById(id);
    if (!existingComplaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const updateData = { status };
    if (status === 'in-progress' && !existingComplaint.responseTime) {
      updateData.responseTime = new Date();
    }
    if ((status === 'resolved' || status === 'closed') && !existingComplaint.resolutionTime) {
      updateData.resolutionTime = new Date();
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after' }
    );

    return NextResponse.json(updatedComplaint);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
