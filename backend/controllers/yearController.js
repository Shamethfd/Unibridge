import Year from "../models/Year.js";

export const getYearsByFaculty = async (req, res) => {
  try {
    const years = await Year.find({ facultyId: req.params.facultyId }).sort({ name: 1 });
    res.json(years);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createYear = async (req, res) => {
  try {
    const year = new Year(req.body);
    const saved = await year.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteYear = async (req, res) => {
  try {
    await Year.findByIdAndDelete(req.params.id);
    res.json({ message: "Year deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
