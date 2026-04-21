const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// Helper function to get the latest active announcement
const getLatestActiveAnnouncement = async () => {
  return await Announcement.findOne({ active: true }).sort({ createdAt: -1 });
};

// GET: Fetch the latest active announcement
router.get('/', async (req, res) => {
  try {
    const announcement = await getLatestActiveAnnouncement();
    res.status(200).json(announcement || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET: Fetch all announcements (for admin)
router.get('/all', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Create a new announcement (deactivates previous ones)
router.post('/', async (req, res) => {
  try {
    const { message, priority = 'warning', icon = '⚠️', autoHideSeconds = null } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Deactivate all previous announcements
    await Announcement.updateMany(
      { active: true },
      { active: false }
    );

    // Create new announcement
    const newAnnouncement = new Announcement({
      message,
      active: true,
      priority,
      icon,
      autoHideSeconds
    });

    await newAnnouncement.save();

    // Emit Socket.IO event to all connected clients
    const io = req.app.get('io');
    io.emit('announcement-update', newAnnouncement);

    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH: Update an announcement
router.patch('/:id', async (req, res) => {
  try {
    const { message, priority, icon, active, autoHideSeconds } = req.body;
    const announcementId = req.params.id;

    const updateData = {
      updatedAt: new Date()
    };

    if (message !== undefined) updateData.message = message;
    if (priority !== undefined) updateData.priority = priority;
    if (icon !== undefined) updateData.icon = icon;
    if (autoHideSeconds !== undefined) updateData.autoHideSeconds = autoHideSeconds;

    // If activating this announcement, deactivate others
    if (active === true) {
      await Announcement.updateMany(
        { _id: { $ne: announcementId }, active: true },
        { active: false }
      );
      updateData.active = true;
    } else if (active === false) {
      updateData.active = false;
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      announcementId,
      updateData,
      { new: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    const latestActive = await getLatestActiveAnnouncement();
    io.emit('announcement-update', latestActive);

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Delete an announcement
router.delete('/:id', async (req, res) => {
  try {
    const announcementId = req.params.id;

    const deletedAnnouncement = await Announcement.findByIdAndDelete(announcementId);

    if (!deletedAnnouncement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Emit Socket.IO event with latest active announcement or null
    const io = req.app.get('io');
    const latestActive = await getLatestActiveAnnouncement();
    io.emit('announcement-update', latestActive);

    res.status(200).json({ message: 'Announcement deleted', deletedAnnouncement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
