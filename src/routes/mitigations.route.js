import express from "express";
import {protect} from "../middleware/auth.js";
import { getMitigations } from "../controllers/mitigation.controller.js";

const router = express.Router();

router.get("/", protect, getMitigations);

export default router;