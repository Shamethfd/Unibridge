const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getTutorFeedbackAndRating
} = require("../controllers/feedbackController");

router.post("/", createFeedback);
router.get("/tutor/:tutorId", getTutorFeedbackAndRating);

module.exports = router;