const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
    default: 'other',
  },
  subcategory: {
    type: String,
    trim: true,
    default: 'Other',
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  complaintText: {
    type: String,
    trim: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  images: {
    type: [String],
    default: [],
  },
  department: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending',
  },
  responseTime: {
    type: Date,
    default: null,
  },
  resolutionTime: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

complaintSchema.pre('save', function handleTimestamps(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
