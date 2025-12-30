import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name)
            return res.status(400).json({ message: "All fields are required" });

        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: "Email already exists" });

        const user = await User.create({
            email,
            password,
            name,
        });

        // Generate token for immediate login after signup
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name,
                twoFactorEnabled: false
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });

        const validPassword = await user.comparePassword(password);
        if (!validPassword)
            return res.status(400).json({ message: "Invalid credentials" });

        // Check if 2FA is enabled
        if (user.twoFactorEnabled) {
            // Return a temporary token that requires 2FA verification
            const tempToken = jwt.sign(
                { id: user._id, temp: true },
                process.env.JWT_SECRET,
                { expiresIn: "10m" }
            );

            return res.json({
                message: "2FA required",
                requires2FA: true,
                tempToken,
                userId: user._id
            });
        }

        // No 2FA, login normally
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login Successful",
            token,
            requires2FA: false,
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name,
                twoFactorEnabled: user.twoFactorEnabled
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Complete login after 2FA verification
export const complete2FALogin = async (req, res) => {
    try {
        const { userId, token: twoFactorToken } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ message: "Invalid request" });
        }

        // This verification is already done in verify2FA endpoint
        // But we double-check here for security
        const speakeasy = (await import("speakeasy")).default;
        
        let verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: twoFactorToken,
            window: 2
        });

        // Check backup codes if TOTP failed
        if (!verified) {
            const backupCode = user.twoFactorBackupCodes.find(
                bc => bc.code === twoFactorToken.toUpperCase() && !bc.used
            );
            
            if (backupCode) {
                verified = true;
                backupCode.used = true;
                await user.save();
            }
        }

        if (!verified) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        // Generate full access token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login Successful",
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name,
                twoFactorEnabled: user.twoFactorEnabled
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};