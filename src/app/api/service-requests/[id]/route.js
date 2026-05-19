import { NextResponse } from 'next/server';
import ServiceRequest from '@models/ServiceRequest';
import { connectToDatabase } from '@/lib/mongodb';

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { status } = await request.json();

    const updated = await ServiceRequest.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
