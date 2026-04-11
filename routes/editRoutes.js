const express = require("express");
const router = express.Router();

const controller = require("../controllers/editController");

router.put("/edit/:id", controller.editStudent);

module.exports = router;