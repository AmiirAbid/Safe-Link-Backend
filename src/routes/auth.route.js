import express from "express";
import { signup, login, complete2FALogin } from "../controllers/auth.controller.js";
import { 
    setup2FA, 
    enable2FA, 
    verify2FA, 
    disable2FA, 
    get2FAStatus 
} from "../controllers/twofa.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Basic auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/login/2fa", complete2FALogin);

// 2FA management routes (protected)
router.get("/2fa/status", protect, get2FAStatus);
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/verify", verify2FA);
router.post("/2fa/disable", protect, disable2FA);

export default router;