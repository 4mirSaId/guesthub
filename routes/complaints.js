const express = require('express');
const Complaint = require('../models/Complaint');
const { notifyNewComplaint } = require('../lib/pushNotifications');

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
    const payload = req.body || {};
    const fullName = payload.fullName?.trim();
    const roomNumber = payload.roomNumber?.trim();
    const description = payload.description?.trim() || payload.complaintText?.trim();
    const category = payload.category?.trim() || 'other';
    const subcategory = payload.subcategory?.trim() || 'Other';
    const priority = payload.priority?.trim() || 'medium';
    const images = Array.isArray(payload.images)
      ? payload.images.filter(Boolean)
      : (payload.images || '').split(',').map((image) => image.trim()).filter(Boolean);

    if (!fullName || !roomNumber || !description) {
      return res.status(400).json({ error: 'Full name, room number, and description are required.' });
    }

    const newComplaint = new Complaint({
      fullName,
      roomNumber,
      category,
      subcategory,
      description,
      complaintText: description,
      priority,
      images,
      department: category === 'housekeeping' ? 'Housekeeping' : 'Reception',
      status: 'pending',
    });

    const savedComplaint = await newComplaint.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('new-complaint', savedComplaint);
    }

    notifyNewComplaint(savedComplaint).catch((err) => {
      console.error('Push notification error (complaint):', err.message);
    });

    res.status(201).json(savedComplaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/complaints/:id - Update complaint status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existingComplaint = await Complaint.findById(req.params.id);
    if (!existingComplaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const updateData = { status };
    if (status === 'in-progress' && !existingComplaint.responseTime) {
      updateData.responseTime = new Date();
    }
    if ((status === 'resolved' || status === 'closed') && !existingComplaint.resolutionTime) {
      updateData.resolutionTime = new Date();
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

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
