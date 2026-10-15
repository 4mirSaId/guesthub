import { NextResponse } from 'next/server';
import ServiceRequest from '@models/ServiceRequest';
import { connectToDatabase } from '@/lib/mongodb';

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { status } = await request.json();
    const { id } = await params;

    const update = { status, updatedAt: new Date() };
    if (status === 'accepted') {
      update.acceptedAt = update.acceptedAt || new Date();
    }
    if (status === 'in-progress') {
      update.startedAt = update.startedAt || new Date();
    }
    if (status === 'completed') {
      update.completedAt = update.completedAt || new Date();
    }
    if (status === 'cancelled') {
      update.cancelledAt = update.cancelledAt || new Date();
    }

    const updated = await ServiceRequest.findByIdAndUpdate(
      id,
      update,
      { returnDocument: 'after' }
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
