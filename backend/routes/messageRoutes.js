import express from "express";
import {
  createMessage,
  getAllMessages,
  approveMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", createMessage);
router.get("/", getAllMessages);
router.put("/:id/approve", approveMessage);

export default router;
