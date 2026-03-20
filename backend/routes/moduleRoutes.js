import express from "express";
import {
  getModulesBySemester,
  createModule,
  updateModule,
  deleteModule,
} from "../controllers/moduleController.js";

const router = express.Router();

router.get("/:semesterId", getModulesBySemester);
router.post("/", createModule);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);

export default router;
