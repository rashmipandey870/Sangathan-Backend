const express = require("express");
const router = express.Router();

const controller = require("../controllers/teamViewController");

router.get("/team/:teamName", controller.getTeamWithPlayers);

module.exports = router;