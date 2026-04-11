const express = require("express");
const router = express.Router();
const EmailVerification = require("../models/EmailVerification");
const Student = require("../models/Student");
const nodemailer = require("nodemailer");

// Generate 6-digit OTP
const generatePin = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= SEND OTP ================= */
router.post("/send-pin", async (req, res) => {
  try {
    const { email, sportId } = req.body;

    if (!email || !sportId) {
      return res.status(400).json({
        message: "Email and sportId required"
      });
    }

    // Delete old OTP
    await EmailVerification.deleteMany({ email, sportId });

    const pin = generatePin();

    await EmailVerification.create({
      email,
      sportId,
      pin,
      isVerified: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    // SEND EMAIL
    await transporter.sendMail({
      from: `"Sangathan Sports" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Sangathan Sport Selection OTP",
      html: `
        <h2> Congratulations!</h2>
        <p>You have been selected for the sport.</p>
        <h3>Your OTP: <b>${pin}</b></h3>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        <p>Regards,<br/>Sangathan Team</p>
      `
    });

    res.json({ message: "OTP sent to email successfully" });

  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

/* ================= VERIFY OTP ================= */
router.post("/verify-pin", async (req, res) => {
  try {
    const { email, sportId, pin } = req.body;

    const record = await EmailVerification.findOne({
      email,
      sportId,
      pin,
      isVerified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!record) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    record.isVerified = true;
    await record.save();
    await Student.findOneAndUpdate({ email,sportId},{status:"VERIFIED"});


    res.json({ message: "OTP verified successfully" });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Verification failed" });
  }
});

module.exports = router;