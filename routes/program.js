const express = require('express');
const Program = require('../models/Program');
const { getDefaultProgram } = require('../lib/programDefaults');
const requireAnimation = require('../middleware/requireAnimation');

const router = express.Router();

async function getOrCreateProgram() {
  let program = await Program.findOne({});
  if (!program) {
    const defaults = getDefaultProgram();
    program = new Program(defaults);
    await program.save();
  }
  return program;
}

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

// GET /api/program — public
router.get('/', async (req, res) => {
  try {
    const program = await getOrCreateProgram();
    res.json(formatProgram(program));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/program — animation staff only
router.put('/', requireAnimation, async (req, res) => {
  try {
    const { activities, nightShows, kidsClub } = req.body;

    if (!Array.isArray(activities) || !nightShows || !Array.isArray(kidsClub)) {
      return res.status(400).json({ error: 'Invalid program payload' });
    }

    let program = await Program.findOne({});
    if (!program) {
      program = new Program(getDefaultProgram());
    }

    program.activities = activities.map((item, index) => ({
      time: String(item.time || '').trim(),
      name: String(item.name || '').trim(),
      order: item.order ?? index,
    })).filter((item) => item.time && item.name);

    program.nightShows = {
      weekA: (nightShows.weekA || []).map((item, index) => ({
        day: String(item.day || '').trim(),
        show: String(item.show || '').trim(),
        emoji: String(item.emoji || '🎭').trim(),
        order: item.order ?? index,
      })).filter((item) => item.day && item.show),
      weekB: (nightShows.weekB || []).map((item, index) => ({
        day: String(item.day || '').trim(),
        show: String(item.show || '').trim(),
        emoji: String(item.emoji || '🎭').trim(),
        order: item.order ?? index,
      })).filter((item) => item.day && item.show),
    };

    program.kidsClub = kidsClub.map((item, index) => ({
      day: String(item.day || '').trim(),
      order: item.order ?? index,
      sessions: (item.sessions || []).map((session) => ({
        label: String(session.label || '').trim(),
        startTime: String(session.startTime || '').trim(),
        endTime: String(session.endTime || '').trim(),
      })).filter((session) => session.label && session.startTime && session.endTime),
    })).filter((item) => item.day && item.sessions.length > 0);

    program.updatedAt = Date.now();
    const saved = await program.save();

    const io = req.app.get('io');
    if (io) io.emit('program-updated', formatProgram(saved));

    res.json(formatProgram(saved));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
