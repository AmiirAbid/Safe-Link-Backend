import User from "../models/User.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";

// Generate 2FA secret and QR code
export const setup2FA = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `SafeLink (${req.user.email})`,
            issuer: "SafeLink"
        });

        // Store temporary secret (not enabled yet)
        await User.findByIdAndUpdate(userId, {
            twoFactorSecret: secret.base32
        });

        // Generate QR code
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

        res.json({
            message: "2FA setup initiated",
            qrCode: qrCodeUrl,
            secret: secret.base32,
            manualEntryKey: secret.base32
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify and enable 2FA
export const enable2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        
        if (!user.twoFactorSecret) {
            return res.status(400).json({ message: "2FA not set up" });
        }

        // Verify the token
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () => ({
            code: crypto.randomBytes(4).toString("hex").toUpperCase(),
            used: false
        }));

        // Enable 2FA
        user.twoFactorEnabled = true;
        user.twoFactorBackupCodes = backupCodes;
        await user.save();

        res.json({
            message: "2FA enabled successfully",
            backupCodes: backupCodes.map(bc => bc.code)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify 2FA token during login
export const verify2FA = async (req, res) => {
    try {
        const { token, userId } = req.body;

        const user = await User.findById(userId);
        
        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ message: "Invalid request" });
        }

        // Try to verify with TOTP
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: token,
            window: 2
        });

        if (verified) {
            return res.json({ 
                verified: true,
                message: "2FA verification successful"
            });
        }

        // Try backup codes if TOTP failed
        const backupCode = user.twoFactorBackupCodes.find(
            bc => bc.code === token.toUpperCase() && !bc.used
        );

        if (backupCode) {
            backupCode.used = true;
            await user.save();
            
            return res.json({ 
                verified: true,
                message: "Backup code used successfully",
                warning: "This backup code cannot be used again"
            });
        }

        res.status(400).json({ 
            verified: false,
            message: "Invalid verification code or backup code" 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Disable 2FA
export const disable2FA = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        
        // Verify password
        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Disable 2FA
        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        user.twoFactorBackupCodes = [];
        await user.save();

        res.json({ message: "2FA disabled successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get 2FA status
export const get2FAStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        res.json({
            enabled: user.twoFactorEnabled,
            backupCodesRemaining: user.twoFactorBackupCodes?.filter(bc => !bc.used).length || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};