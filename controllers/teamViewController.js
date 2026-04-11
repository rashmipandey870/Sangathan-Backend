const Team = require("../models/Team");
const Student = require("../models/Student");


// GET TEAM + PLAYERS

exports.getTeamWithPlayers = async (req, res) => {
  try {

    const { teamName } = req.params;

    const team = await Team.findOne({
      teamName: teamName.toUpperCase()
    });

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    const players = await Student.find({
      teamName: { $regex: new RegExp("^"+ teamName +"$","i")}
    });

    res.json({
      captainName: team.captainName,
      players
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching team" });
  }
};