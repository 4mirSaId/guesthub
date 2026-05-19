import { NextResponse } from 'next/server';
import Feedback from '@models/Feedback';
import { connectToDatabase } from '@/lib/mongodb';
import { getAuthUser } from '@/lib/authToken';

function computeIsPublic(rating) {
  const value = Number(rating);
  if (Number.isNaN(value) || value < 1 || value > 5) return false;
  return value >= 3;
}

export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const list = await Feedback.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const { type, rating, comment, clientId } = await request.json();

    if (!clientId || String(clientId).trim() === '') {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const allowedTypes = Feedback.FEEDBACK_TYPES || ['Service', 'Restaurant', 'Animation', 'General'];
    if (!type || !allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid or missing type' }, { status: 400 });
    }

    const numRating = Number(rating);
    if (Number.isNaN(numRating) || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
      return NextResponse.json({ error: 'Rating must be an integer from 1 to 5' }, { status: 400 });
    }

    const saved = await new Feedback({
      type: type.trim(),
      rating: numRating,
      comment: typeof comment === 'string' ? comment.trim() : '',
      clientId: String(clientId).trim(),
      isPublic: computeIsPublic(numRating),
    }).save();

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
