import { NextResponse } from 'next/server';
import SongRequest from '@models/SongRequest';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    const requests = await SongRequest.find().sort({ createdAt: -1 });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const { song, artist } = await request.json();

    if (!song || song.trim() === '') {
      return NextResponse.json({ error: 'Song name is required' }, { status: 400 });
    }

    const savedRequest = await new SongRequest({
      song: song.trim(),
      artist: artist ? artist.trim() : '',
    }).save();

    return NextResponse.json(savedRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
