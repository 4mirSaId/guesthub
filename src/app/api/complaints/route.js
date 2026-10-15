import { NextResponse } from 'next/server';
import Complaint from '@models/Complaint';
import { connectToDatabase } from '@/lib/mongodb';
import { getDepartmentForCategory } from '@/lib/complaintConfig';

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
    const payload = await request.json();
    const fullName = payload.fullName?.trim();
    const roomNumber = payload.roomNumber?.trim();
    const description = payload.description?.trim() || payload.complaintText?.trim();
    const category = payload.category?.trim() || 'other';
    const subcategory = payload.subcategory?.trim() || 'Other';
    const priority = payload.priority?.trim() || 'medium';
    const images = Array.isArray(payload.images)
      ? payload.images.filter(Boolean)
      : (payload.images || '').split(',').map((image) => image.trim()).filter(Boolean);

    if (!fullName || !roomNumber || !description) {
      return NextResponse.json(
        { error: 'Full name, room number, and description are required.' },
        { status: 400 }
      );
    }

    const savedComplaint = await new Complaint({
      fullName,
      roomNumber,
      category,
      subcategory,
      description,
      complaintText: description,
      priority,
      images,
      department: getDepartmentForCategory(category),
      status: 'pending',
    }).save();

    return NextResponse.json(savedComplaint, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
