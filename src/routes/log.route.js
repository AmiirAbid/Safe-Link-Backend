import express from "express";
import { getLogs, getLogById } from "../controllers/log.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getLogs);
router.get("/:id", protect, getLogById);

export default router;
