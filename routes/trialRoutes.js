// routes/trialRoutes.js
const express = require("express");
const router = express.Router();
const TrialSchedule = require("../models/TrialSchedule");
const Team = require("../models/Team");

//  CREATE TRIAL (Captain / Coordinator)
router.post("/create", async (req, res) => {
  try {
    const { teamId, teamName, date, time, venue, instructions } = req.body;

    if (teamId === "SPORT") {
      // Coordinator scheduling for a sport
      const sportName = teamName.trim().toLowerCase();
      // Find all teams for this sport
      const teams = await Team.find({ sport: sportName });
      
      if (teams.length === 0) {
        return res.status(400).json({ message: `No teams found for sport: ${teamName}` });
      }

      const trialsCreated = [];
      for (const team of teams) {
        // Upsert the trial schedule for each team
        const trial = await TrialSchedule.findOneAndUpdate(
          { teamId: team._id },
          {
            teamName: team.teamName.toUpperCase(),
            teamId: team._id,
            date,
            time,
            venue,
            instructions: instructions || "TRIAL SCHEDULED BY COORDINATOR"
          },
          { upsert: true, new: true }
        );
        trialsCreated.push(trial);
      }

      return res.json({
        message: `Trial schedules updated for ${teams.length} team(s)`,
        trials: trialsCreated
      });
    }

    // Otherwise, normal team-specific trial (Captain)
    const finalTeamName = teamName ? teamName.toUpperCase() : "";
    const trial = await TrialSchedule.create({
      teamName: finalTeamName,
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
    console.error("ERROR CREATING TRIAL:", err);
    res.status(500).json({ message: "Error creating trial", error: err.message });
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

//  GET TRIAL BY TEAM NAME (Student)
router.get("/teamByName/:teamName", async (req, res) => {
  try {
    const teamName = req.params.teamName.toUpperCase();
    const trials = await TrialSchedule
      .find({ teamName })
      .sort({ createdAt: -1 })
      .limit(1);
    res.json(trials);
  } catch (err) {
    res.status(500).json({ message: "Error fetching trial" });
  }
});

module.exports = router;