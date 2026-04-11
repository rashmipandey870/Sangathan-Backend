const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
});

const profileSchema = new mongoose.Schema({
  name: String,
  role: String,
  email: { type: String, unique: true },
  phone: String,
  batch: String,

  stats: {
    sports: Number,
    events: Number,
    medals: Number,
  },

  achievements: [achievementSchema],
});

module.exports = mongoose.model("Profile", profileSchema);