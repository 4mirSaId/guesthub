const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['animation', 'guestrelation'],
    required: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  userAgent: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports =
  mongoose.models.PushSubscription ||
  mongoose.model('PushSubscription', pushSubscriptionSchema);
