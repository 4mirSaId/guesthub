import { NextResponse } from 'next/server';
import Program from '@models/Program';
import { connectToDatabase } from '@/lib/mongodb';
import { getDefaultProgram } from '@/lib/programDefaults';
import { getAuthUser } from '@/lib/authToken';

function sortByOrder(items = []) {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function formatProgram(program) {
  const doc = program.toObject ? program.toObject() : program;
  return {
    _id: doc._id,
    activities: sortByOrder(doc.activities || []),
    nightShows: {
      weekA: sortByOrder(doc.nightShows?.weekA || []),
      weekB: sortByOrder(doc.nightShows?.weekB || []),
    },
    kidsClub: sortByOrder(doc.kidsClub || []),
    updatedAt: doc.updatedAt,
  };
}

async function getOrCreateProgram() {
  let program = await Program.findOne({});
  if (!program) {
    program = await new Program(getDefaultProgram()).save();
  }
  return program;
}

export async function GET() {
  try {
    await connectToDatabase();
    const program = await getOrCreateProgram();
    return NextResponse.json(formatProgram(program));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'animation') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { activities, nightShows, kidsClub } = await request.json();

    if (!Array.isArray(activities) || !nightShows || !Array.isArray(kidsClub)) {
      return NextResponse.json({ error: 'Invalid program payload' }, { status: 400 });
    }

    let program = await Program.findOne({});
    if (!program) {
      program = new Program(getDefaultProgram());
    }

    program.activities = activities
      .map((item, index) => ({
        time: String(item.time || '').trim(),
        name: String(item.name || '').trim(),
        order: item.order ?? index,
      }))
      .filter((item) => item.time && item.name);

    program.nightShows = {
      weekA: (nightShows.weekA || [])
        .map((item, index) => ({
          day: String(item.day || '').trim(),
          show: String(item.show || '').trim(),
          emoji: String(item.emoji || 'ðŸŽ­').trim(),
          order: item.order ?? index,
        }))
        .filter((item) => item.day && item.show),
      weekB: (nightShows.weekB || [])
        .map((item, index) => ({
          day: String(item.day || '').trim(),
          show: String(item.show || '').trim(),
          emoji: String(item.emoji || 'ðŸŽ­').trim(),
          order: item.order ?? index,
        }))
        .filter((item) => item.day && item.show),
    };

    program.kidsClub = kidsClub
      .map((item, index) => ({
        day: String(item.day || '').trim(),
        order: item.order ?? index,
        sessions: (item.sessions || [])
          .map((session) => ({
            label: String(session.label || '').trim(),
            startTime: String(session.startTime || '').trim(),
            endTime: String(session.endTime || '').trim(),
          }))
          .filter((session) => session.label && session.startTime && session.endTime),
      }))
      .filter((item) => item.day && item.sessions.length > 0);

    program.updatedAt = Date.now();
    const saved = await program.save();

    return NextResponse.json(formatProgram(saved));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
