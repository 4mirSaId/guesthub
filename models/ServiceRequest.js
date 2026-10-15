const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
  requestId: String,
  guestName: String,
  roomNumber: String,
  room: String,
  category: {
    type: String,
    default: "housekeeping",
  },
  service: String,
  type: String,
  description: String,
  message: String,
  preferredTime: String,
  priority: {
    type: String,
    enum: ["normal", "high", "urgent"],
    default: "normal",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

serviceRequestSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  if (!this.requestId) {
    this.requestId = `SR-${Date.now().toString().slice(-6)}`;
  }
  next();
});

module.exports = mongoose.models.ServiceRequest || mongoose.model("ServiceRequest", serviceRequestSchema);