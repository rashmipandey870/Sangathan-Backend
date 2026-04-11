const Student = require("../models/Student");


// EDIT STUDENT DETAILS

exports.editStudent = async (req, res) => {
  try {

    const { id } = req.params;

    const updated = await Student.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Student updated",
      student: updated
    });

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};