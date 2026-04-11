const Team = require("../models/Team");

// PIN generator
const generatePin = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

// CREATE TEAM
exports.createTeam = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {
      teamName,
      captainName,
      enrollment,
      department,
      gender,
      sport
    } = req.body;

    //  VALIDATION
    if (!teamName || !captainName || !enrollment ||
        !department || !gender || !sport) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    //  CHECK DUPLICATE MANUALLY
    const existing = await Team.findOne({
      teamName: teamName.toUpperCase()
    });

    if (existing) {
      return res.status(400).json({
        message: "Team already exists"
      });
    }

    const pin = generatePin();

    const team = await Team.create({
      teamName: teamName.toUpperCase(),
      captainName: captainName.toUpperCase(),
      enrollment: enrollment.toUpperCase(),
      department: department.toUpperCase(),
      gender: gender.toUpperCase(),
      sport: sport.toLowerCase(),
      pin
    });

    res.status(201).json({
      message: "Team created successfully",
      pin,
      team
    });

  } catch (err) {
    console.error("FULL ERROR : ");
    res.status(500).json({ message: err.message });
  }
};

// GET ALL TEAMS
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: "Error fetching teams" });
  }
};