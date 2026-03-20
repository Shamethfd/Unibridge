import Module from "../models/Module.js";

export const getModulesBySemester = async (req, res) => {
  try {
    const modules = await Module.find({ semesterId: req.params.semesterId }).sort({
      requestCount: -1,
    });
    res.json(modules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createModule = async (req, res) => {
  try {
    const module = new Module(req.body);
    const saved = await module.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateModule = async (req, res) => {
  try {
    const updated = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Module not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteModule = async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    res.json({ message: "Module deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
