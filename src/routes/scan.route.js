import express from "express";
import {scan} from "../controllers/scan.controller.js";
import {protect} from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, scan);

export default router;
