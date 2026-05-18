const express = require('express');
const Feedback = require('../models/Feedback');

const router = express.Router();

function requireAdminToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function computeIsPublic(rating) {
  const r = Number(rating);
  if (Number.isNaN(r) || r < 1 || r > 5) return false;
  return r >= 3;
}

// POST /api/feedback — create (no auth)
router.post('/', async (req, res) => {
  try {
    const { type, rating, comment, clientId } = req.body;

    if (!clientId || String(clientId).trim() === '') {
      return res.status(400).json({ error: 'clientId is required' });
    }

    const allowedTypes = Feedback.FEEDBACK_TYPES || ['Service', 'Restaurant', 'Animation', 'General'];
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid or missing type' });
    }

    const numRating = Number(rating);
    if (Number.isNaN(numRating) || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
      return res.status(400).json({ error: 'Rating must be an integer from 1 to 5' });
    }

    const isPublic = computeIsPublic(numRating);

    const doc = new Feedback({
      type: type.trim(),
      rating: numRating,
      comment: typeof comment === 'string' ? comment.trim() : '',
      clientId: String(clientId).trim(),
      isPublic,
    });

    const saved = await doc.save();
    const io = req.app.get('io');
    if (io) {
      io.emit('new-feedback', saved);
    }

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/feedback/public — public reviews only
router.get('/public', async (req, res) => {
  try {
    const list = await Feedback.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/feedback — all feedback (admin)
router.get('/', requireAdminToken, async (req, res) => {
  try {
    const list = await Feedback.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
