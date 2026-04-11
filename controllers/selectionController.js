const Student = require("../models/Student");


// SELECT PLAYER

exports.selectPlayer = async (req, res) => {
  try {

    const { id } = req.params;

    const student = await Student.findByIdAndUpdate(
      id,
      { status: "SELECTED" },
      { new: true }
    );

    res.json({
      message: "Player selected",
      student
    });

  } catch (err) {
    res.status(500).json({ message: "Selection failed" });
  }
};


// REJECT PLAYER

exports.rejectPlayer = async (req, res) => {
  try {

    const { id } = req.params;

    const student = await Student.findByIdAndUpdate(
      id,
      { status: "REJECTED" },
      { new: true }
    );

    res.json({
      message: "Player rejected",
      student
    });

  } catch (err) {
    res.status(500).json({ message: "Reject failed" });
  }
};