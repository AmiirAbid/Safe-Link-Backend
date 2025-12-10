import express from "express";
import { getAlerts, getAlert,deleteAlert } from "../controllers/alerts.controller.js";
import {protect} from "../middleware/auth.js";
import { mitigateAlert } from "../controllers/mitigation.controller.js";

const router = express.Router();

// GET /api/alerts?page=1&limit=10&status=open&severity=high
router.get("/", protect, getAlerts);
router.get("/:id", protect, getAlert);
router.delete("/:id", protect, deleteAlert);
router.patch("/:id/mitigate",protect,mitigateAlert)
export default router;
