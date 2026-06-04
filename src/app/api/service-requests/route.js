import { createRequire } from 'node:module';
import { NextResponse } from 'next/server';
import ServiceRequest from '@models/ServiceRequest';
import { connectToDatabase } from '@/lib/mongodb';

const require = createRequire(import.meta.url);
const { notifyNewServiceRequest } = require('../../../../lib/pushNotifications');

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

    notifyNewServiceRequest(newRequest).catch((err) => {
      console.error('Push notification error (service request):', err.message);
    });

    return NextResponse.json(newRequest);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
