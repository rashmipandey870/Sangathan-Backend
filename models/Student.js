const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

  registrationId: String,

  studentName: {
    type: String,
    uppercase: true
  },

  enrollment: {
    type: String,
    uppercase: true
  },

  department: {
    type: String,
    uppercase: true
  },

  teamName: {
    type: String,
    uppercase: true
  },

  gender: {
    type: String,
    uppercase: true
  },

  phone: String,
  email: String,

  sportId: Number,

  
  status: {
    type: String,
    enum: ["REGISTERED", "SELECTED", "REJECTED"],
    default: "REGISTERED"
  }

}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);