const express = require("express");
const router = express.Router();
const controller = require("../controllers/selectionController");
const Student = require("../models/Student");

router.put("/select-player/:id",controller.selectPlayer);
router.put("/reject-player/:id",controller.rejectPlayer);


// UPDATE SELECTION (FRONTEND MATCH)
const updateSelectionHandler = async (req, res) => {
  try {
    const { studentId, status } = req.body;

    if (!studentId || !status) {
      return res.status(400).json({
        message: "studentId and status required"
      });
    }

    const student = await Student.findOneAndUpdate(
      { _id: studentId },
      { status: status },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Status updated",
      student
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Selection failed"
    });
  }
};

router.post("/selection/update", updateSelectionHandler);
router.post("/selection/update-selection", updateSelectionHandler);
router.post("/update", updateSelectionHandler);

module.exports = router;