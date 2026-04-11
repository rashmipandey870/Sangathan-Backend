
const express = require("express");
const router = express.Router();
const Team = require("../models/Team");

const teamController = require("../controllers/teamController");

//  CREATE TEAM
router.post("/create-team", teamController.createTeam);

//  GET ALL TEAMS
router.get("/teams", teamController.getAllTeams);
router.get("/filter", async (req, res) => {
  try {

    
    const { department, gender, sport } = req.query;

    const query = {};

    if (department) query.department = department.toUpperCase();
    if (gender) query.gender = gender.toUpperCase();
    if (sport){ query.sport = {$regex: new RegExp("^"+sport+"$","i")};
}

    console.log("FILTER QUERY:", query); 
    const teams = await Team.find(query);

    res.json(teams);

  } catch (err) {
    console.error("FILTER ERROR:", err); // show real error
    res.status(500).json({ message: "Error fetching teams" });
  }
});

router.get("/departments", async (req, res) => {
  try {
    const departments = await Team.distinct("department");
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching departments" });
  }
});

router.get("/teamByName/:teamName", async (req, res) => {
  try {

    const teamName = req.params.teamName.toUpperCase();

    const trials = await TrialSchedule
      .find({ teamName })   // use teamName
      .sort({ createdAt: -1 })
      .limit(1);

    res.json(trials);

  } catch (err) {
    res.status(500).json({ message: "Error fetching trial" });
  }
});

module.exports = router;