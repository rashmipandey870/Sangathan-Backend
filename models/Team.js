const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({

  teamName: {
    type: String,
    required: true,
    uppercase: true,
    unique: true,
    trim: true
  },

  captainName: {
    type: String,
    required: true,
    uppercase: true
  },

  enrollment: {
    type: String,
    required: true,
    uppercase: true
  },

  department: {
    type: String,
    required: true,
    uppercase: true
  },

  gender: {
    type: String,
    required: true,
    uppercase: true
  },

  sport: {
    type: String,
    required: true,
    lowercase: true
  },

  pin: String

}, { timestamps: true });

module.exports = mongoose.model("Team", teamSchema);