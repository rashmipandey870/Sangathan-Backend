const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// CREATE PROFILE (after registration)
router.post("/profile", async (req, res) => {
  try {
    const profile = new Profile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ message: "Profile creation failed" });
  }
});

// GET PROFILE
router.get("/profile/:email", async (req, res) => {
  const profile = await Profile.findOne({ email: req.params.email });
  if (!profile) return res.status(404).json({ message: "Profile not found" });
  res.json(profile);
});

// UPDATE PROFILE
router.put("/profile/:email", async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { email: req.params.email },
    req.body,
    { new: true }
  );
  res.json(profile);
});

// ADD ACHIEVEMENT
router.post("/profile/:email/achievement", async (req, res) => {
  const profile = await Profile.findOne({ email: req.params.email });
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  profile.achievements.push(req.body);
  await profile.save();
  res.json(profile);
});

// UPDATE STATS
router.put("/profile/:email/stats", async (req, res) => {
  const profile = await Profile.findOne({ email: req.params.email });
  if (!profile) return res.status(404).json({ message: "Profile not found" });

  profile.stats = req.body;
  await profile.save();
  res.json(profile);
});

module.exports = router;