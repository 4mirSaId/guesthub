const express = require('express');
const SpecialEvent = require('../models/SpecialEvent');

const router = express.Router();

// GET /api/events - Get all special events sorted by newest first
router.get('/', async (req, res) => {
  try {
    const events = await SpecialEvent.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/events - Create new special event
router.post('/', async (req, res) => {
  try {
    const { eventName, time, location, moreInfo } = req.body;

    if (!eventName || !eventName.trim() || !time || !time.trim() || !location || !location.trim()) {
      return res.status(400).json({ error: 'Event name, time, and location are required.' });
    }

    const newEvent = new SpecialEvent({
      eventName: eventName.trim(),
      time: time.trim(),
      location: location.trim(),
      moreInfo: moreInfo ? moreInfo.trim() : ''
    });

    const savedEvent = await newEvent.save();

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('new-event', savedEvent);
    }

    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/events/:id - Update special event
router.patch('/:id', async (req, res) => {
  try {
    const { eventName, time, location, moreInfo } = req.body;

    const updateData = {};
    if (eventName !== undefined) updateData.eventName = eventName.trim();
    if (time !== undefined) updateData.time = time.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (moreInfo !== undefined) updateData.moreInfo = moreInfo ? moreInfo.trim() : '';

    const updatedEvent = await SpecialEvent.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('update-event', updatedEvent);
    }

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/events/:id - Delete special event
router.delete('/:id', async (req, res) => {
  try {
    const deletedEvent = await SpecialEvent.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('delete-event', deletedEvent._id);
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;