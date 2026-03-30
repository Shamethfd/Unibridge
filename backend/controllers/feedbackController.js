const Feedback = require("../models/Feedback");

exports.createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getTutorFeedbackAndRating = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const feedbacks = await Feedback.find({ tutorId }).sort({ createdAt: -1 });

    if (feedbacks.length === 0) {
      return res.json({ success: true, averageRating: 0, count: 0, feedbacks: [] });
    }

    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const average = sum / feedbacks.length;

    res.json({
      success: true,
      averageRating: Number(average.toFixed(2)),
      count: feedbacks.length,
      feedbacks
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};