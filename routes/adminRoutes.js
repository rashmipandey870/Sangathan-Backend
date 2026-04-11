const express = require("express");
const router = express.Router();

const Team = require("../models/Team");
const Fixture = require("../models/Fixture");

/* 
   GENERATE FIXTURE (FINAL FIXED)
 */
router.post("/admin/generate-fixture", async (req, res) => {
  try {
    console.log("BODY:", req.body); 

    const { sport, gender, dates, times } = req.body;

    //  VALIDATION
    if (!sport || !gender || !dates || !times) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    if (dates.length === 0 || times.length === 0) {
      return res.status(400).json({
        message: "Dates or Times empty"
      });
    }

    // FETCH TEAMS
    let teams = await Team.find({
      sport: sport.toLowerCase().trim(),
      gender: gender.toUpperCase().trim()
    });

    console.log("FOUND TEAMS:", teams.length);

    if (!teams || teams.length < 2) {
      return res.status(400).json({
        message: "Not enough teams"
      });
    }

    //shuffle
    teams.sort(() => Math.random() - 0.5);

    // delete old
    await Fixture.deleteMany({
      sport: sport.toLowerCase(),
      gender: gender.toUpperCase()
    });

    //  HANDLE ODD
    if (teams.length % 2 !== 0) {
      teams.push({ teamName: "BYE" });
    }

    let fixtures = [];
    let round = 1;

    for (let i = 0; i < teams.length; i += 2) {

      fixtures.push({
        sport: sport.toLowerCase(),
        gender: gender.toUpperCase(),
        teamA: teams[i].teamName,   
        teamB: teams[i + 1].teamName, 
        round: round++,
        matchDate: dates[i % dates.length],
        matchTime: times[i % times.length],
        venue: "Venue not assigned"
      });
    }

    await Fixture.insertMany(fixtures);

    res.json({
      message: "Fixtures generated successfully"
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});

// GET FIXTURES (VERY IMPORTANT)

router.get("/fixtures/:sport", async (req, res) => {
  try {
    console.log(" GET FIXTURE API HIT");

    const sport = req.params.sport.toLowerCase();
    const gender = req.query.gender?.toUpperCase();

    let query = { sport };

    if (gender) {
      query.gender = gender;
    }

    const fixtures = await Fixture.find(query);

    res.json(fixtures);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch fixtures" });
  }
});

module.exports = router;