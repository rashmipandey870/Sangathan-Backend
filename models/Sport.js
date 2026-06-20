const mongoose = require("mongoose");

const sportSchema = new mongoose.Schema({
  sportId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: String,
  date: String,
  venue: String,
  level: String,
  maxParticipants: {
    type: Number,
    default: 200
  },
  year: {
    type: Number,
    required: true
  },
  coordinatorName: {
    type: String,
    default: ""
  },
  coordinatorEmail: {
    type: String,
    default: ""
  },
  coordinatorPhone: {
    type: String,
    default: ""
  },
  iconName: {
    type: String,
    default: "ic_default"
  }
}, { timestamps: true });

module.exports = mongoose.model("Sport", sportSchema);
