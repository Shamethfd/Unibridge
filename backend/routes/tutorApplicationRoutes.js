const express = require("express");
const router = express.Router();

const {
  createApplication,
  getAllApplications,
  approveApplication,
  rejectApplication
} = require("../controllers/tutorApplicationController");

router.post("/", createApplication);
router.get("/", getAllApplications);
router.patch("/:id/approve", approveApplication);
router.patch("/:id/reject", rejectApplication);

module.exports = router;