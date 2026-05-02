const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  partyName: {
    type: String,
    default: 'Hotel Name Community'
  },
  dailyDressThemeName: {
    type: String,
    default: 'Beach Casual'
  },
  currentWeek: {
    type: String,
    enum: ['A', 'B'],
    default: 'A'
  },
  theme: {
    bgColor: { type: String, default: '#ffffff' },
    accentColor: { type: String, default: '#10b981' },
    textColor: { type: String, default: '#1f2937' },
    cardBgColor: { type: String, default: '#ffffff' }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
