const express = require("express");
const router = express.Router();
const ServiceRequest = require("../models/ServiceRequest");
const { notifyNewServiceRequest } = require("../lib/pushNotifications");

// CREATE
router.post("/", async (req, res) => {
  const { guestName, roomNumber, room, category, service, type, description, message, preferredTime, priority, status } = req.body;

  const newRequest = new ServiceRequest({
    guestName,
    roomNumber: roomNumber || room,
    room: roomNumber || room,
    category: category || "housekeeping",
    service: service || type || "Custom request",
    type: type || service || "Custom request",
    description: description || message || "",
    message: description || message || "",
    preferredTime,
    priority: priority || "normal",
    status: status || "pending",
  });

  await newRequest.save();

  const io = req.app.get("io");
  if (io) {
    io.emit("new-service-request", newRequest);
  }

  notifyNewServiceRequest(newRequest).catch((err) => {
    console.error("Push notification error (service request):", err.message);
  });

  res.json(newRequest);
});

// GET ALL
router.get("/", async (req, res) => {
  const data = await ServiceRequest.find().sort({ createdAt: -1 });
  res.json(data);
});

// UPDATE STATUS
router.patch("/:id", async (req, res) => {
  const { status } = req.body;

  const updated = await ServiceRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  const io = req.app.get("io");
  if (io) {
    io.emit("update-service-request", updated);
  }

  res.json(updated);
});

module.exports = router;
