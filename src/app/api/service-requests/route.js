import { NextResponse } from 'next/server';
import ServiceRequest from '@models/ServiceRequest';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    const data = await ServiceRequest.find().sort({ createdAt: -1 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const { room, type, message } = await request.json();

    const newRequest = await new ServiceRequest({
      room,
      type,
      message,
    }).save();

    return NextResponse.json(newRequest);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
