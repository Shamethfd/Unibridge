const express = require("express");
const router = express.Router();

const { createSession, getAllSessions } = require("../controllers/studySessionController");

router.post("/", createSession);
router.get("/", getAllSessions);

module.exports = router;