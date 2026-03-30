import Faculty from "../models/Faculty.js";

export const getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ createdAt: 1 });
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    const saved = await faculty.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const updated = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Faculty not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: "Faculty deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
