import express from "express";
import {
  getYearsByFaculty,
  createYear,
  deleteYear,
} from "../controllers/yearController.js";

const router = express.Router();

router.get("/:facultyId", getYearsByFaculty);
router.post("/", createYear);
router.delete("/:id", deleteYear);

export default router;
