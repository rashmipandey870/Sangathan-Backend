const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Team = require("../models/Team");


// =======================
// REGISTER STUDENT
// =======================
router.post("/register", async (req, res) => {
  try {

    console.log("REGISTER BODY:", req.body);

    const {
      studentName,
      enrollment,
      department,
      teamName,
      gender,
      phone,
      email,
      sportId
    } = req.body;

    //  VALIDATION
    if (!studentName || !enrollment || !department ||
        !teamName || !gender || !phone || !email || !sportId) {

      return res.status(400).json({
        message: "All fields are required"
      });
    }

    //  CHECK TEAM EXISTS
    const team = await Team.findOne({
      teamName: teamName.toUpperCase()
    });

    if (!team) {
      return res.status(400).json({
        message: "Invalid team selected"
      });
    }

    //  CHECK IF ALREADY REGISTERED FOR THIS SPORT
    const alreadyRegisteredForSport = await Student.findOne({
      enrollment: enrollment.toUpperCase(),
      sportId: Number(sportId)
    });

    if (alreadyRegisteredForSport) {
      return res.status(400).json({
        message: "Already registered for this sport"
      });
    }

    //  CHECK MAXIMUM 2 SPORTS REGISTRATION CONSTRAINT
    const registrationCount = await Student.countDocuments({
      enrollment: enrollment.toUpperCase()
    });

    if (registrationCount >= 2) {
      return res.status(400).json({
        message: "Student cannot register in more than 2 sports"
      });
    }

  

    //  CREATE STUDENT
    const student = await Student.create({
      registrationId: Date.now().toString(),
      studentName: studentName.toUpperCase(),
      enrollment: enrollment.toUpperCase(),
      department: department.toUpperCase(),
      teamName: teamName.toUpperCase(),
      gender: gender.toUpperCase(),
      phone,
      email,
      sportId,
      status: "REGISTERED"
    });

    res.status(201).json({
      message: "Registration successful",
      student
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
});





// GET STUDENTS BY TEAM

router.get("/team/students/:teamName", async (req, res) => {
  try {

    const teamName = req.params.teamName.toUpperCase();
    const type = req.query.type; 

    let filter = { teamName };

    // CONTROL DATA FROM BACKEND
    if (type === "SELECTED") {
      filter.status = "SELECTED";
    } else if (type === "REGISTERED") {
      filter.status = "REGISTERED";
    }

    const students = await Student.find(filter);

    res.json(students);

  } catch (err) {
    res.status(500).json({
      message: "Error fetching students"
    });
  }
});



// UPDATE SELECTION

router.post("/team/update-selection", async (req, res) => {
  try {

    const { studentId, status } = req.body;

    if (!studentId || !status) {
      return res.status(400).json({
        message: "studentId and status required"
      });
    }

    const updated = await Student.findByIdAndUpdate(
      studentId,
      { status: status.toUpperCase() },
      { new: true }
    );

    res.json({
      message: "Status updated",
      student: updated
    });

  } catch (err) {
    res.status(500).json({
      message: "Update failed"
    });
  }
});



// STUDENT VIEW TEAM (ONLY SELECTED)

router.get("/student/team/:teamName", async (req, res) => {
  try {

    const teamName = req.params.teamName.toUpperCase();

    const team = await Team.findOne({ teamName });

    if (!team) {
      return res.status(404).json({
        message: "Team not found"
      });
    }

    const players = await Student.find({
      teamName,
      status: "SELECTED"
    });

    res.json({
      teamName,
      captainName: team.captainName,
      players
    });

  } catch (err) {
    res.status(500).json({
      message: "Error fetching team"
    });
  }
});



// EDIT STUDENT

router.put("/student/edit/:id", async (req, res) => {
  try {

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Student updated",
      student: updated
    });

  } catch (err) {
    res.status(500).json({
      message: "Update failed"
    });
  }
});


// GET STUDENT STATUS BY EMAIL OR ENROLLMENT (DYNAMIC STATUS RETRIEVAL)
router.get("/student/status/:identifier", async (req, res) => {
  try {
    const identifier = req.params.identifier.toUpperCase().trim();
    const registrations = await Student.find({
      $or: [
        { enrollment: identifier },
        { email: identifier.toLowerCase() }
      ]
    });
    res.json(registrations);
  } catch (err) {
    console.error("GET STUDENT STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch student status" });
  }
});

module.exports = router;