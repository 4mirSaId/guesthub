import { NextResponse } from 'next/server';
import Complaint from '@models/Complaint';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    return NextResponse.json(complaints);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const { fullName, roomNumber, complaintText } = await request.json();

    if (!fullName || !fullName.trim() || !roomNumber || !roomNumber.trim() || !complaintText || !complaintText.trim()) {
      return NextResponse.json(
        { error: 'Full name, room number, and complaint text are required.' },
        { status: 400 }
      );
    }

    const savedComplaint = await new Complaint({
      fullName: fullName.trim(),
      roomNumber: roomNumber.trim(),
      complaintText: complaintText.trim(),
    }).save();

    return NextResponse.json(savedComplaint, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
