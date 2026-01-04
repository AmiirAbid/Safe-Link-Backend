import User from "../models/User.js";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate and send 2FA code via SendGrid
export const send2FACode = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log("Request to send 2FA code for userId:", userId);
        console.log("Using SendGrid API Key:", process.env.SENDGRID_API_KEY);
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Generate 6-digit code
        const code = crypto.randomInt(100000, 999999).toString();
        console.log(`Generated 2FA code for user ${user.email}:`, code);
        
        // Store code with expiry (5 minutes)
        user.twoFactorCode = code;
        user.twoFactorCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        // SendGrid email message
        const msg = {
            to: user.email,
            from: process.env.EMAIL_FROM, // Your verified sender email
            subject: 'SafeLink - Your Verification Code',
            text: `Your SafeLink verification code is: ${code}. This code will expire in 5 minutes.`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>SafeLink Verification Code</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 40px 0; text-align: center;">
                                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                                                🔐 SafeLink Security
                                            </h1>
                                        </td>
                                    </tr>
                                    
                                    <!-- Body -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">
                                                Verification Code
                                            </h2>
                                            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
                                                Hello <strong>${user.name}</strong>,
                                            </p>
                                            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
                                                Your verification code is:
                                            </p>
                                            
                                            <!-- Code Box -->
                                            <table role="presentation" style="width: 100%; margin: 0 0 32px 0;">
                                                <tr>
                                                    <td style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center;">
                                                        <span style="color: #6366f1; font-size: 48px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                            ${code}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
                                                ⏱️ This code will expire in <strong>5 minutes</strong>.
                                            </p>
                                            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                                                🔒 If you didn't request this code, please ignore this email or contact our support team.
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #1f2937; padding: 30px 20px; text-align: center;">
                                            <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">
                                                SafeLink Security - Protecting Your Network
                                            </p>
                                            <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                                © 2025 SafeLink. All rights reserved.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
        };

        // Send email via SendGrid
        await sgMail.send(msg);

        res.json({ 
            message: "Verification code sent to your email",
            expiresIn: 300 // 5 minutes in seconds
        });
    } catch (error) {
        console.error("SendGrid error:", error);
        
        // Handle specific SendGrid errors
        if (error.response) {
            console.error("SendGrid response error:", error.response.body);
            return res.status(500).json({ 
                message: "Failed to send verification code. Please check your email configuration." 
            });
        }
        
        res.status(500).json({ message: "Failed to send verification code" });
    }
};

// Verify 2FA code
export const verify2FA = async (req, res) => {
    try {
        const { userId, token } = req.body;

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

        if (user.twoFactorCode !== token) {
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