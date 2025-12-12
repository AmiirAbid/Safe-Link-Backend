import express from "express";
import {protect} from "../middleware/auth.js";
import { getMitigations } from "../controllers/mitigation.controller.js";

const router = express.Router();

// GET /api/alerts?page=1&limit=10&status=open&severity=high
router.get("/", protect, getMitigations);

export default router;