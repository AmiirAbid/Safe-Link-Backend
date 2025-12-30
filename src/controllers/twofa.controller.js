import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Configure email transporter (using Gmail as example)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS  // Your email app password
    }
});

// Generate and send 2FA code via email
export const send2FACode = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Generate 6-digit code
        const code = crypto.randomInt(100000, 999999).toString();
        
        // Store code with expiry (5 minutes)
        user.twoFactorCode = code;
        user.twoFactorCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'SafeLink - Your Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">SafeLink Security</h1>
                    </div>
                    <div style="padding: 40px; background: #f9fafb;">
                        <h2 style="color: #1f2937; margin-top: 0;">Verification Code</h2>
                        <p style="color: #4b5563; font-size: 16px;">Hello ${user.name},</p>
                        <p style="color: #4b5563; font-size: 16px;">Your verification code is:</p>
                        <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
                            <h1 style="color: #6366f1; font-size: 48px; letter-spacing: 8px; margin: 0;">${code}</h1>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">This code will expire in 5 minutes.</p>
                        <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                    </div>
                    <div style="background: #1f2937; padding: 20px; text-align: center;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 SafeLink. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            message: "Verification code sent to your email",
            expiresIn: 300 // 5 minutes in seconds
        });
    } catch (error) {
        console.error("Email send error:", error);
        res.status(500).json({ message: "Failed to send verification code" });
    }
};

// Verify 2FA code
export const verify2FA = async (req, res) => {
    try {
        const { userId, code } = req.body;

        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if code exists and hasn't expired
        if (!user.twoFactorCode || !user.twoFactorCodeExpiry) {
            return res.status(400).json({ message: "No verification code found. Please request a new one." });
        }

        if (new Date() > user.twoFactorCodeExpiry) {
            return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
        }

        if (user.twoFactorCode !== code) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        // Clear the code after successful verification
        user.twoFactorCode = null;
        user.twoFactorCodeExpiry = null;
        await user.save();

        res.json({ 
            verified: true,
            message: "Verification successful"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Enable 2FA for user
export const enable2FA = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        user.twoFactorEnabled = true;
        await user.save();

        res.json({ 
            message: "Two-factor authentication enabled successfully",
            enabled: true
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
        
        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        user.twoFactorEnabled = false;
        user.twoFactorCode = null;
        user.twoFactorCodeExpiry = null;
        await user.save();

        res.json({ message: "Two-factor authentication disabled successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get 2FA status
export const get2FAStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        res.json({
            enabled: user.twoFactorEnabled || false
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};