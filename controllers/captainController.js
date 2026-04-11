const Team = require("../models/Team");

exports.captainLogin = async (req, res) => {
  
  try {

    let { teamName, pin } = req.body;

    console.log("LOGIN TRY:",teamName,pin);

    const allTeams=await Team.find();
    console.log("ALL TEAMS:",allTeams);
    teamName = teamName.replaceAll("_"," ").trim().toUpperCase();
    pin = Number(pin);

    const team = await Team.findOne({
      teamName: teamName,
      pin: Number(pin)
    });

    if (!team) {
      return res.status(401).json({
        message: "Invalid team or PIN"
      });
    }

    res.json({
      message: "Login successful",
      team
    });

  } catch (err) {
    console.log("ERROR:",err);
    res.status(500).json({
      message: "Login error"
    });
  }
  console.log("BODY RECEIVED:",req.body);
};