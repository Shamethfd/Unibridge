import express from "express";
import {
  getAllRequests,
  getRequestsByModule,
  createRequest,
  joinRequest,
  updateRequestStatus,
  deleteRequest,
  getDashboardStats,
} from "../controllers/requestController.js";

const router = express.Router();

router.get("/", getAllRequests);
router.get("/stats/dashboard", getDashboardStats);
router.get("/module/:id", getRequestsByModule);
router.post("/", createRequest);
router.put("/:id/join", joinRequest);
router.put("/:id/status", updateRequestStatus);
router.delete("/:id", deleteRequest);

export default router;
