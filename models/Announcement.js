const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['info', 'warning', 'danger'],
    default: 'warning'
  },
  icon: {
    type: String,
    default: ''
  },
  autoHideSeconds: {
    type: Number,
    default: null // null means no auto-hide
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for finding active announcements
announcementSchema.index({ active: 1, createdAt: -1 });

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
