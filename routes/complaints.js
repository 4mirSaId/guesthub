const express = require('express');
const Complaint = require('../models/Complaint');

const router = express.Router();

// GET /api/complaints - Get all complaints sorted by newest first
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/complaints - Create new complaint
router.post('/', async (req, res) => {
  try {
    const { fullName, roomNumber, complaintText } = req.body;

    if (!fullName || !fullName.trim() || !roomNumber || !roomNumber.trim() || !complaintText || !complaintText.trim()) {
      return res.status(400).json({ error: 'Full name, room number, and complaint text are required.' });
    }

    const newComplaint = new Complaint({
      fullName: fullName.trim(),
      roomNumber: roomNumber.trim(),
      complaintText: complaintText.trim()
    });

    const savedComplaint = await newComplaint.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('new-complaint', savedComplaint);
    }

    res.status(201).json(savedComplaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/complaints/:id - Update complaint status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('update-complaint', updatedComplaint);
    }

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
