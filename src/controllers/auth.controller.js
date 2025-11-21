import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// @desc Signup
export const signup = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Validate fields
        if (!email || !password || !username)
            return res.status(400).json({ message: "All fields are required" });

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: "Email already exists" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            username,
        });

        res.status(201).json({
            message: "User registered successfully",
            user: { id: user._id, email: user.email, username: user.username },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });

        // Compare password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login Successful",
            token,
            user: { id: user._id, email: user.email, username: user.username },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
