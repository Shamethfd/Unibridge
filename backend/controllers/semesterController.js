import Semester from "../models/Semester.js";

export const getSemestersByYear = async (req, res) => {
  try {
    const semesters = await Semester.find({ yearId: req.params.yearId }).sort({ name: 1 });
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createSemester = async (req, res) => {
  try {
    const semester = new Semester(req.body);
    const saved = await semester.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteSemester = async (req, res) => {
  try {
    await Semester.findByIdAndDelete(req.params.id);
    res.json({ message: "Semester deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
