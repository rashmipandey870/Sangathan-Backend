const express = require("express");
const router = express.Router();

const Team = require("../models/Team");
const Fixture = require("../models/Fixture");
const Student = require("../models/Student");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper to parse fixture dates of formats "DD-MM-YYYY" or "YYYY-MM-DD" or standard date formats
function parseFixtureDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const cleanStr = dateStr.trim();
  const dmyRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
  const match = cleanStr.match(dmyRegex);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }
  const parsed = Date.parse(cleanStr);
  if (!isNaN(parsed)) {
    return new Date(parsed);
  }
  return null;
}

// Helper to filter fixtures to only show active round based on dates
async function filterFixturesByTimeline(fixtures) {
  const groups = {};
  for (const f of fixtures) {
    const key = `${f.sport.toLowerCase()}_${f.gender.toUpperCase()}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(f);
  }

  const filtered = [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const key of Object.keys(groups)) {
    const groupFixtures = groups[key];
    const roundMaxDates = {};
    for (const f of groupFixtures) {
      const parsedDate = parseFixtureDate(f.matchDate);
      if (parsedDate) {
        if (!roundMaxDates[f.round] || parsedDate > roundMaxDates[f.round]) {
          roundMaxDates[f.round] = parsedDate;
        }
      }
    }

    let activeRound = 1;
    const r1MaxDate = roundMaxDates[1];
    const r2MaxDate = roundMaxDates[2];
    const r3MaxDate = roundMaxDates[3];

    if (r1MaxDate && todayStart <= r1MaxDate) {
      activeRound = 1;
    } else if (r2MaxDate && todayStart <= r2MaxDate) {
      activeRound = 2;
    } else if (r3MaxDate) {
      activeRound = 3;
    } else {
      const roundsInGroup = groupFixtures.map(f => f.round);
      activeRound = roundsInGroup.length > 0 ? Math.min(...roundsInGroup) : 1;
    }

    for (const f of groupFixtures) {
      if (f.round === activeRound) {
        filtered.push(f);
      }
    }
  }

  return filtered;
}

// Function to notify students about scheduled match
const notifyMatchSchedule = async (fixture) => {
  try {
    const { sport, gender, teamA, teamB, matchDate, matchTime, venue } = fixture;
    if (teamA === "BYE" || teamB === "BYE") return; // No email for BYE match

    // Find students registered for teamA or teamB
    const students = await Student.find({
      teamName: { $in: [teamA.toUpperCase(), teamB.toUpperCase()] }
    });

    console.log(`Found ${students.length} students to notify for fixture ${teamA} vs ${teamB}`);

    for (const student of students) {
      if (student.email) {
        // Send email asynchronously
        transporter.sendMail({
          from: `"Sangathan Sports" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: `Sangathan Match Scheduled: ${teamA} vs ${teamB}`,
          html: `
            <h2>Match Scheduled Notification</h2>
            <p>Dear <b>${student.studentName}</b>,</p>
            <p>Your team's match has been scheduled/updated by the Sports Coordinator. Here are the details:</p>
            <table border="1" cellpadding="8" style="border-collapse: collapse; border-color: #ddd;">
              <tr bgcolor="#f2f2f2">
                <td><b>Sport</b></td>
                <td>${sport.toUpperCase()} (${gender})</td>
              </tr>
              <tr>
                <td><b>Match</b></td>
                <td><b>${teamA}</b> vs <b>${teamB}</b></td>
              </tr>
              <tr bgcolor="#f2f2f2">
                <td><b>Date</b></td>
                <td>${matchDate || "To Be Decided"}</td>
              </tr>
              <tr>
                <td><b>Time</b></td>
                <td>${matchTime || "To Be Decided"}</td>
              </tr>
              <tr bgcolor="#f2f2f2">
                <td><b>Venue</b></td>
                <td>${venue || "Venue not assigned"}</td>
              </tr>
            </table>
            <br/>
            <p>Please report to the venue 15 minutes before the scheduled time.</p>
            <p>Regards,<br/><b>Sangathan Sports Committee</b></p>
          `
        }).catch(err => console.error(`Failed to send match email to ${student.email}:`, err));
      }
    }
  } catch (err) {
    console.error("Error in notifyMatchSchedule:", err);
  }
};

/* 
   GENERATE FIXTURE (FINAL FIXED)
 */
router.post("/admin/generate-fixture", async (req, res) => {
  try {
    console.log("BODY:", req.body); 

    const { sport, gender, dates, times, round } = req.body;

    // VALIDATION
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

    const roundNum = Number(round) || 1;

    if (roundNum > 3) {
      return res.status(400).json({
        message: "Knockout tournaments are restricted to a maximum of 3 rounds (Round 1, Semifinals, Finals)."
      });
    }

    // CHECK IF FIXTURES ALREADY EXIST FOR THIS ROUND
    const existingFixtures = await Fixture.findOne({
      sport: sport.toLowerCase().trim(),
      gender: gender.toUpperCase().trim(),
      round: roundNum
    });

    if (existingFixtures) {
      return res.status(400).json({
        message: `Fixtures for Round ${roundNum} have already been generated and cannot be changed or regenerated.`
      });
    }

    if (roundNum === 1) {
      // FETCH TEAMS
      let teams = await Team.find({
        sport: sport.toLowerCase().trim(),
        gender: gender.toUpperCase().trim()
      });

      console.log("FOUND TEAMS FOR ROUND 1:", teams.length);

      if (!teams || teams.length < 2) {
        return res.status(400).json({
          message: "Not enough teams to generate fixtures"
        });
      }

      // shuffle
      teams.sort(() => Math.random() - 0.5);

      // delete all rounds to restart tournament
      await Fixture.deleteMany({
        sport: sport.toLowerCase(),
        gender: gender.toUpperCase()
      });

      // HANDLE ODD
      let byeTeam = null;
      if (teams.length % 2 !== 0) {
        byeTeam = teams.pop().teamName;
      }

      let fixtures = [];
      for (let i = 0; i < teams.length; i += 2) {
        fixtures.push({
          sport: sport.toLowerCase(),
          gender: gender.toUpperCase(),
          teamA: teams[i].teamName,   
          teamB: teams[i + 1].teamName, 
          round: 1,
          matchDate: dates[i % dates.length],
          matchTime: times[i % times.length],
          venue: "Venue not assigned",
          winner: ""
        });
      }

      if (byeTeam) {
        fixtures.push({
          sport: sport.toLowerCase(),
          gender: gender.toUpperCase(),
          teamA: byeTeam,
          teamB: "BYE",
          round: 1,
          matchDate: dates[teams.length % dates.length],
          matchTime: times[teams.length % times.length],
          venue: "Venue not assigned",
          winner: byeTeam
        });
      }

      await Fixture.insertMany(fixtures);

      return res.json({
        message: "Round 1 fixtures generated successfully"
      });

    } else {
      // GENERATING ROUND > 1
      const prevRoundFixtures = await Fixture.find({
        sport: sport.toLowerCase(),
        gender: gender.toUpperCase(),
        round: roundNum - 1
      });

      if (!prevRoundFixtures || prevRoundFixtures.length === 0) {
        return res.status(400).json({
          message: `No fixtures found for Round ${roundNum - 1}. Cannot generate Round ${roundNum}.`
        });
      }

      const winners = [];
      for (const f of prevRoundFixtures) {
        let win = f.winner;
        if (!win) {
          if (f.teamB === "BYE" || !f.teamB) {
            win = f.teamA;
          } else if (f.teamA === "BYE" || !f.teamA) {
            win = f.teamB;
          }
        }

        if (!win || win.trim() === "") {
          return res.status(400).json({
            message: `Please select a winner for the match: ${f.teamA} vs ${f.teamB} in Round ${roundNum - 1} first.`
          });
        }

        if (win !== "BYE") {
          winners.push(win);
        }
      }

      if (roundNum === 3 && winners.length === 3) {
        const winnersWithScores = [];
        for (const win of winners) {
          const match = prevRoundFixtures.find(f => f.winner === win || (f.winner === "" && (f.teamA === win || f.teamB === win)));
          let score = 0;
          if (match) {
            if (match.teamA === win) {
              score = Number(match.scoreA) || 0;
            } else if (match.teamB === win) {
              score = Number(match.scoreB) || 0;
            }
          }
          winnersWithScores.push({ team: win, score });
        }
        // Sort descending by score
        winnersWithScores.sort((a, b) => b.score - a.score);
        console.log("Top 2 teams selected for Round 3 final by score:", winnersWithScores);
        
        winners.length = 0;
        winners.push(winnersWithScores[0].team);
        winners.push(winnersWithScores[1].team);
      }

      if (winners.length < 2) {
        return res.status(400).json({
          message: `Only ${winners.length} winner(s) found. Need at least 2 teams to generate the next round.`
        });
      }

      // Delete existing fixtures for this round and subsequent rounds
      await Fixture.deleteMany({
        sport: sport.toLowerCase(),
        gender: gender.toUpperCase(),
        round: { $gte: roundNum }
      });

      let byeTeam = null;
      if (winners.length % 2 !== 0) {
        const previousBYEMatches = await Fixture.find({
          sport: sport.toLowerCase(),
          gender: gender.toUpperCase(),
          $or: [
            { teamA: "BYE" },
            { teamB: "BYE" }
          ]
        });

        const teamsWithPreviousByes = new Set();
        for (const m of previousBYEMatches) {
          if (m.teamA && m.teamA !== "BYE") {
            teamsWithPreviousByes.add(m.teamA.toUpperCase().trim());
          }
          if (m.teamB && m.teamB !== "BYE") {
            teamsWithPreviousByes.add(m.teamB.toUpperCase().trim());
          }
        }

        let byeCandidateIndex = -1;
        for (let i = 0; i < winners.length; i++) {
          const winnerUpper = winners[i].toUpperCase().trim();
          if (!teamsWithPreviousByes.has(winnerUpper)) {
            byeCandidateIndex = i;
            break;
          }
        }

        if (byeCandidateIndex !== -1) {
          byeTeam = winners.splice(byeCandidateIndex, 1)[0];
        } else {
          byeTeam = winners.pop();
        }
      }

      // Shuffle remaining winners
      winners.sort(() => Math.random() - 0.5);

      let fixtures = [];
      for (let i = 0; i < winners.length; i += 2) {
        fixtures.push({
          sport: sport.toLowerCase(),
          gender: gender.toUpperCase(),
          teamA: winners[i],   
          teamB: winners[i + 1], 
          round: roundNum,
          matchDate: dates[i % dates.length],
          matchTime: times[i % times.length],
          venue: "Venue not assigned",
          winner: ""
        });
      }

      if (byeTeam) {
        fixtures.push({
          sport: sport.toLowerCase(),
          gender: gender.toUpperCase(),
          teamA: byeTeam,
          teamB: "BYE",
          round: roundNum,
          matchDate: dates[winners.length % dates.length],
          matchTime: times[winners.length % times.length],
          venue: "Venue not assigned",
          winner: byeTeam
        });
      }

      await Fixture.insertMany(fixtures);

      return res.json({
        message: `Round ${roundNum} fixtures generated successfully`
      });
    }

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({
      message: "Server error generating fixtures"
    });
  }
});

// UPDATE WINNER (NEW)
router.post("/admin/update-winner/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { winner } = req.body;

    const fixture = await Fixture.findByIdAndUpdate(
      id,
      { winner },
      { new: true }
    );

    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }

    res.json({
      message: "Winner updated successfully",
      fixture
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update winner" });
  }
});

// UPDATE VENUE AND SCHEDULE (UPDATED)
router.post("/admin/update-venue/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { venue, matchDate, matchTime, scoreA, scoreB } = req.body;

    const updateFields = {};
    if (venue !== undefined) updateFields.venue = venue;
    if (matchDate !== undefined) updateFields.matchDate = matchDate;
    if (matchTime !== undefined) updateFields.matchTime = matchTime;
    if (scoreA !== undefined) updateFields.scoreA = scoreA;
    if (scoreB !== undefined) updateFields.scoreB = scoreB;

    const fixture = await Fixture.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }

    // Trigger asynchronous email notifications to the playing students
    notifyMatchSchedule(fixture);

    res.json({
      message: "Fixture details updated successfully",
      fixture
    });
  } catch (err) {
    console.error("UPDATE FIXTURE ERROR:", err);
    res.status(500).json({ message: "Failed to update fixture details" });
  }
});

// GET ALL FIXTURES (across all sports)
router.get("/fixtures", async (req, res) => {
  try {
    const { gender, round, limit } = req.query;
    const query = {};
    if (gender) query.gender = gender.toUpperCase();
    if (round) query.round = Number(round);

    let dbQuery = Fixture.find(query).sort({ createdAt: -1 });
    if (limit) {
      dbQuery = dbQuery.limit(Number(limit));
    }
    let fixtures = await dbQuery;
    if (round === undefined) {
      fixtures = await filterFixturesByTimeline(fixtures);
    }
    res.json(fixtures);
  } catch (err) {
    console.error("GET ALL FIXTURES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch all fixtures" });
  }
});

// GET FIXTURES (WITH ROUND FILTER)
router.get("/fixtures/:sport", async (req, res) => {
  try {
    console.log("GET FIXTURE API HIT");

    const sport = req.params.sport.toLowerCase();
    const gender = req.query.gender?.toUpperCase();
    const round = req.query.round;

    let query = { sport };

    if (gender) {
      query.gender = gender;
    }

    if (round) {
      query.round = Number(round);
    }

    let fixtures = await Fixture.find(query);
    if (round === undefined) {
      fixtures = await filterFixturesByTimeline(fixtures);
    }
    res.json(fixtures);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch fixtures" });
  }
});

// GET TOURNAMENT LEADERBOARD (Department Standings - DYNAMIC AS REQUESTED)
router.get("/admin/leaderboard", async (req, res) => {
  try {
    const gender = req.query.gender?.toUpperCase() || "BOYS";
    const sport = req.query.sport?.toLowerCase();

    // Fetch all teams to construct a teamName -> department map
    const teams = await Team.find({});
    const teamToDeptMap = {};
    const defaultDepts = [
      "COMPUTER SCIENCE & ENGINEERING",
      "INFORMATION TECHNOLOGY",
      "ELECTRONICS & COMMUNICATION",
      "MECHANICAL ENGINEERING",
      "CIVIL ENGINEERING",
      "BUSINESS ADMINISTRATION"
    ];
    const allDepartments = new Set(defaultDepts);

    for (const t of teams) {
      if (t.teamName && t.department) {
        teamToDeptMap[t.teamName.toUpperCase().trim()] = t.department.toUpperCase().trim();
        allDepartments.add(t.department.toUpperCase().trim());
      }
    }

    // Query fixtures matching the filters
    const query = { gender };
    if (sport) {
      query.sport = sport.toLowerCase().trim();
    }

    const fixtures = await Fixture.find(query);

    // Count wins per department
    const deptWins = {};
    for (const dept of allDepartments) {
      deptWins[dept] = 0;
    }

    for (const f of fixtures) {
      if (f.winner && f.winner.trim() !== "" && f.winner.toUpperCase() !== "BYE") {
        const winnerName = f.winner.toUpperCase().trim();
        const dept = teamToDeptMap[winnerName];
        if (dept) {
          deptWins[dept] = (deptWins[dept] || 0) + 1;
        }
      }
    }

    // Convert to leaderboard list and sort descending
    const leaderboard = Object.keys(deptWins).map(dept => ({
      department: dept,
      wins: deptWins[dept]
    }));

    leaderboard.sort((a, b) => b.wins - a.wins);

    res.json(leaderboard);
  } catch (err) {
    console.error("GET LEADERBOARD ERROR:", err);
    res.status(500).json({ message: "Failed to load dynamic leaderboard standings" });
  }
});

// GET SYSTEM GENERAL STATISTICS (Head Admin Overview)
router.get("/admin/stats", async (req, res) => {
  try {
    const Sport = require("../models/Sport");
    const Student = require("../models/Student");

    const totalSports = await Sport.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalFixtures = await Fixture.countDocuments();

    res.json({
      totalSports,
      totalTeams,
      totalStudents,
      totalFixtures
    });
  } catch (err) {
    console.error("GET STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load system stats" });
  }
});

module.exports = router;