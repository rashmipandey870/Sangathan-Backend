const mongoose = require("mongoose");

const fixtureSchema = new mongoose.Schema({

  sport: {
    type: String,
    required: true,
    lowercase: true
  },

  gender: {
    type: String,
    required: true,
    uppercase: true
  },

  teamA: String,
  teamB: String,

  round: Number,

  matchDate: String,
  matchTime: String,

  venue: {
    type: String,
    default: "Venue not assigned"
  }

}, { timestamps: true });

module.exports = mongoose.model("Fixture", fixtureSchema);