import express from "express";
import { signup, login, complete2FALogin } from "../controllers/auth.controller.js";
import { 
    send2FACode,
    verify2FA, 
    enable2FA,
    disable2FA, 
    get2FAStatus 
} from "../controllers/twofa.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Basic auth routes
router.post("/signup", signup);
router.post("/login", login);

// 2FA routes
router.post("/2fa/send", send2FACode);        // Send code to email
router.post("/2fa/verify", verify2FA);         // Verify the code
router.post("/login/2fa", complete2FALogin);   // Complete login after verification

// 2FA management routes (protected)
router.get("/2fa/status", protect, get2FAStatus);
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/disable", protect, disable2FA);

export default router;