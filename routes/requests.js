const express = require('express');
const SongRequest = require('../models/SongRequest');
const { notifyNewSongRequest } = require('../lib/pushNotifications');

const router = express.Router();

// GET /api/requests - Get all requests sorted by newest first
router.get('/', async (req, res) => {
  try {
    const requests = await SongRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/requests - Create new request
router.post('/', async (req, res) => {
  try {
    const { song, artist } = req.body;
    if (!song || song.trim() === '') {
      return res.status(400).json({ error: 'Song name is required' });
    }

    const newRequest = new SongRequest({
      song: song.trim(),
      artist: artist ? artist.trim() : ''
    });

    const savedRequest = await newRequest.save();

    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('new-request', savedRequest);

    notifyNewSongRequest(savedRequest).catch((err) => {
      console.error('Push notification error (song request):', err.message);
    });

    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/requests/:id - Update status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedRequest = await SongRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('update-request', updatedRequest);

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;