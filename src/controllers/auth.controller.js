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
            // DO NOT return a full access token yet
            // Return userId for 2FA verification
            return res.json({
                message: "2FA required",
                requires2FA: true,
                userId: user._id.toString()
            });
        }

        // No 2FA, login normally with full token
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

        // Import speakeasy
        const speakeasy = (await import("speakeasy")).default;
        
        // Verify TOTP code
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

        // NOW generate the full access token
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