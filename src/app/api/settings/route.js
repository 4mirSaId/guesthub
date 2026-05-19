import { NextResponse } from 'next/server';
import Settings from '@models/Settings';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await new Settings().save();
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectToDatabase();
    const { partyName, dailyDressThemeName, currentWeek, theme } = await request.json();

    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings();
    }

    if (partyName !== undefined) settings.partyName = partyName;
    if (dailyDressThemeName !== undefined) settings.dailyDressThemeName = dailyDressThemeName;
    if (currentWeek !== undefined) settings.currentWeek = currentWeek;
    if (theme) {
      if (theme.bgColor) settings.theme.bgColor = theme.bgColor;
      if (theme.accentColor) settings.theme.accentColor = theme.accentColor;
      if (theme.textColor) settings.theme.textColor = theme.textColor;
      if (theme.cardBgColor) settings.theme.cardBgColor = theme.cardBgColor;
    }
    settings.updatedAt = Date.now();

    const updatedSettings = await settings.save();
    return NextResponse.json(updatedSettings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
