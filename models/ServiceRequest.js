const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
  room: String,
  type: String,
  message: String,
  status: {
    type: String,
    enum: ["pending", "in-progress", "done"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);