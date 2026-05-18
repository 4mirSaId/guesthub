const express = require("express");
const router = express.Router();
const ServiceRequest = require("../models/ServiceRequest");

// CREATE
router.post("/", async (req, res) => {
  const { room, type, message } = req.body;

  const newRequest = new ServiceRequest({
    room,
    type,
    message,
  });

  await newRequest.save();

  const io = req.app.get("io");
  if (io) {
    io.emit("new-service-request", newRequest);
  }

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
