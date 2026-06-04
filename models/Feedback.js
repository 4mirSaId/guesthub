const mongoose = require('mongoose');

const FEEDBACK_TYPES = ['Service', 'Restaurant', 'Animation', 'General'];

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: FEEDBACK_TYPES,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: '',
    trim: true,
    maxlength: 2000,
  },
  clientId: {
    type: String,
    required: true,
    trim: true,
  },
  isPublic: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const feedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
feedbackModel.FEEDBACK_TYPES = FEEDBACK_TYPES;
module.exports = feedbackModel;
