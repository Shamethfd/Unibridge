import express from "express";
import UserPreference from "../models/UserPreference.js";

const router = express.Router();

// GET /api/preferences/:userId
router.get("/:userId", async (req, res) => {
  try {
    const pref = await UserPreference.findOne({ userId: req.params.userId });
    if (!pref) return res.json(null);
    res.json(pref);
  } catch (err) {
    res.status(500).json({ message: "Error fetching preference" });
  }
});

// PUT /api/preferences/:userId  (upsert)
router.put("/:userId", async (req, res) => {
  try {
    const { faculty, year, semester, module } = req.body;
    const pref = await UserPreference.findOneAndUpdate(
      { userId: req.params.userId },
      { faculty, year, semester, module },
      { upsert: true, new: true }
    );
    res.json(pref);
  } catch (err) {
    res.status(500).json({ message: "Error saving preference" });
  }
});

// DELETE /api/preferences/:userId
router.delete("/:userId", async (req, res) => {
  try {
    await UserPreference.deleteOne({ userId: req.params.userId });
    res.json({ message: "Preference cleared" });
  } catch (err) {
    res.status(500).json({ message: "Error clearing preference" });
  }
});

export default router;
