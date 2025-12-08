import express from "express";
import { getAlerts } from "../controllers/alerts.controller.js";
import {protect} from "../middleware/auth.js";

const router = express.Router();

// GET /api/alerts?page=1&limit=10&status=open&severity=high
router.get("/", protect, getAlerts);

export default router;
