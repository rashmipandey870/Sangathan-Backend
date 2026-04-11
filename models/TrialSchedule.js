const mongoose = require("mongoose");

const trialScheduleSchema = new mongoose.Schema({

  teamName:{
    type:String,
    uppercase:true
  },
  
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },

  date: String,
  time: String,
  venue: String,
  instructions: String  

}, { timestamps: true });

module.exports = mongoose.model("TrialSchedule", trialScheduleSchema);