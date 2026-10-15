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
    const { guestName, roomNumber, room, category, service, type, description, message, preferredTime, priority, status } = await request.json();

    const newRequest = await new ServiceRequest({
      guestName,
      roomNumber: roomNumber || room,
      room: roomNumber || room,
      category: category || 'housekeeping',
      service: service || type || 'Custom request',
      type: type || service || 'Custom request',
      description: description || message || '',
      message: description || message || '',
      preferredTime,
      priority: priority || 'normal',
      status: status || 'pending',
    }).save();

    notifyNewServiceRequest(newRequest).catch((err) => {
      console.error('Push notification error (service request):', err.message);
    });

    return NextResponse.json(newRequest);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
