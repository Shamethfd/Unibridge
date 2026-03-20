import express from "express";
import {
  getSemestersByYear,
  createSemester,
  deleteSemester,
} from "../controllers/semesterController.js";

const router = express.Router();

router.get("/:yearId", getSemestersByYear);
router.post("/", createSemester);
router.delete("/:id", deleteSemester);

export default router;
