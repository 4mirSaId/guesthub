import { NextResponse } from 'next/server';
import Feedback from '@models/Feedback';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    const list = await Feedback.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
