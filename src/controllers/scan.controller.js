import axios from "axios";
import { generateRandomFeatures } from "../utils/randomFeatures.js";

// YOUR FLASK API URL (Render)
const FLASK_API_URL = process.env.FLASK_API_URL;

export const scan = async (req, res) => {
    try {
        // 1. Generate random feature values
        const inputData = generateRandomFeatures();

        // 2. Send to Flask /predict
        const response = await axios.post(FLASK_API_URL+'/predict', inputData);

        // 3. Return Flask prediction directly
        return res.status(200).json({
            success: true,
            generated_features: inputData,
            prediction: response.data,
        });

    } catch (error) {
        console.error("Scan error:", error.message);
        return res.status(500).json({
            success: false,
            error: "Failed to scan or reach prediction API",
            details: error.response?.data || error.message,
        });
    }
};