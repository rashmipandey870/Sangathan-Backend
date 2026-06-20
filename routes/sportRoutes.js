const express = require("express");
const router = express.Router();
const Sport = require("../models/Sport");
const Student = require("../models/Student");

// GET ALL DISTINCT YEARS THAT HAVE SPORTS
router.get("/sports/years", async (req, res) => {
  try {
    const years = await Sport.distinct("year");
    years.sort((a, b) => b - a); // descending order
    res.json(years);
  } catch (err) {
    console.error("GET DISTINCT YEARS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch years" });
  }
});

// GET ALL SPORTS (with dynamic student registration counts)
router.get("/sports", async (req, res) => {
  try {
    const { year } = req.query;
    const filter = {};
    if (year) {
      filter.year = Number(year);
    }

    const sports = await Sport.find(filter).sort({ sportId: 1 });
    
    // Add dynamic counts to each sport object
    const sportsWithCounts = [];
    for (let sport of sports) {
      const participantsCount = await Student.countDocuments({ sportId: sport.sportId });
      const selectedCount = await Student.countDocuments({ sportId: sport.sportId, status: "SELECTED" });
      
      sportsWithCounts.push({
        ...sport.toObject(),
        participantsCount,
        selectedCount
      });
    }

    res.json(sportsWithCounts);
  } catch (err) {
    console.error("GET SPORTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch sports" });
  }
});

// ADD NEW SPORT (Admin only)
router.post("/sports", async (req, res) => {
  try {
    const { name, description, date, venue, level, maxParticipants, year, iconName } = req.body;

    if (!name || !year) {
      return res.status(400).json({ message: "Sport name and year are required" });
    }

    // Auto-increment sportId
    const maxSport = await Sport.findOne().sort({ sportId: -1 });
    const nextSportId = maxSport ? maxSport.sportId + 1 : 1;

    const sport = await Sport.create({
      sportId: nextSportId,
      name: name.toUpperCase(),
      description: description || "",
      date: date || "",
      venue: venue || "",
      level: level || "",
      maxParticipants: Number(maxParticipants) || 200,
      year: Number(year),
      iconName: iconName || "ic_default"
    });

    res.status(201).json({
      message: "Sport added successfully",
      sport
    });
  } catch (err) {
    console.error("ADD SPORT ERROR:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Sport with this name already exists" });
    }
    res.status(500).json({ message: "Failed to add sport" });
  }
});

// ASSIGN COORDINATOR TO SPORT (Admin only)
router.put("/sports/:id/coordinator", async (req, res) => {
  try {
    const { id } = req.params;
    const { coordinatorName, coordinatorEmail, coordinatorPhone } = req.body;

    const sport = await Sport.findByIdAndUpdate(
      id,
      {
        coordinatorName: coordinatorName || "",
        coordinatorEmail: coordinatorEmail || "",
        coordinatorPhone: coordinatorPhone || ""
      },
      { new: true }
    );

    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    res.json({
      message: "Coordinator assigned successfully",
      sport
    });
  } catch (err) {
    console.error("ASSIGN COORDINATOR ERROR:", err);
    res.status(500).json({ message: "Failed to assign coordinator" });
  }
});

// DELETE SPORT (Admin only)
router.delete("/sports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sport = await Sport.findById(id);

    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    const Team = require("../models/Team");
    const teamsExist = await Team.exists({ sport: sport.name.toLowerCase() });
    const studentsExist = await Student.exists({ sportId: sport.sportId });

    if (teamsExist || studentsExist) {
      return res.status(400).json({
        message: "Cannot delete sport because team creation or student registration has already started."
      });
    }

    await Sport.findByIdAndDelete(id);

    res.json({ message: "Sport removed successfully", sport });
  } catch (err) {
    console.error("DELETE SPORT ERROR:", err);
    res.status(500).json({ message: "Failed to remove sport" });
  }
});

// GET SPORT ASSIGNED TO A COORDINATOR
router.get("/sports/coordinator/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const sport = await Sport.findOne({
      $or: [
        { coordinatorEmail: { $regex: new RegExp("^" + identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") } },
        { coordinatorName: { $regex: new RegExp("^" + identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "$", "i") } }
      ]
    });
    if (!sport) {
      return res.status(404).json({ message: "No sport found for this coordinator" });
    }
    res.json(sport);
  } catch (err) {
    console.error("GET COORDINATOR SPORT ERROR:", err);
    res.status(500).json({ message: "Failed to fetch coordinator sport" });
  }
});

module.exports = router;
