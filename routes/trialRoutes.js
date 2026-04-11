// routes/trialRoutes.js
const express = require("express");
const router = express.Router();
const TrialSchedule = require("../models/TrialSchedule");

//  CREATE TRIAL (Captain)
router.post("/create", async (req, res) => {
  try {
    const { teamId,teamName, date, time, venue, instructions } = req.body;

    const trial = await TrialSchedule.create({
      teamName:
      teamName.toUpperCase(),
      teamId,
      date,
      time,
      venue,
      instructions
    });

    res.json({
      message: "Trial created",
      trial
    });

  } catch (err) {
    res.status(500).json({ message: "Error creating trial" });
  }
});


//  GET TRIAL BY TEAM (Student)
router.get("/team/:teamId", async (req, res) => {
  try {

    const { teamId } = req.params;

    const trials = await TrialSchedule
      .find({ teamId })
      .sort({ createdAt: -1 })   // latest first
      .limit(1);                 // only latest

    res.json(trials);

  } catch (err) {
    res.status(500).json({ message: "Error fetching trial" });
  }
});

module.exports = router;