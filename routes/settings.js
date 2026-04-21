const express = require('express');
const Settings = require('../models/Settings');

const router = express.Router();

// GET /api/settings - Get current settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/settings - Update settings
router.patch('/', async (req, res) => {
  try {
    const { partyName, dailyDressThemeName, currentWeek, theme } = req.body;
    
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

    // Emit Socket.IO event to update all clients
    const io = req.app.get('io');
    io.emit('settings-updated', updatedSettings);

    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
