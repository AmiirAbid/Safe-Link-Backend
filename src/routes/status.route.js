import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        return res.json("MongoDB Connected Successfully!");
    } catch (error) {
        return res.json("MongoDB Connection Failed:", error.message);
    }
});

export default router;