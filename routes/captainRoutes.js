const express = require("express");
const router = express.Router();

const captainController = require("../controllers/captainController");

// Captain login route
router.post("/captain/login", captainController.captainLogin);


module.exports = router;