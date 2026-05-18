const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const nightShowItemSchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    show: { type: String, required: true },
    emoji: { type: String, default: '🎭' },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const kidsClubSessionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: true }
);

const kidsClubDaySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    sessions: [kidsClubSessionSchema],
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const programSchema = new mongoose.Schema({
  activities: [activitySchema],
  nightShows: {
    weekA: [nightShowItemSchema],
    weekB: [nightShowItemSchema],
  },
  kidsClub: [kidsClubDaySchema],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Program', programSchema);
