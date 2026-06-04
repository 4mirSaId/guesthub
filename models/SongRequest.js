const mongoose = require('mongoose');

const songRequestSchema = new mongoose.Schema({
  song: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.SongRequest || mongoose.model('SongRequest', songRequestSchema);