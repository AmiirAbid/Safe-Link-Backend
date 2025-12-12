import axios from "axios";
import { generateRandomFeatures } from "../utils/randomFeatures.js";

const FLASK_API_URL = process.env.FLASK_API_URL;

export const scan = async (req, res) => {
    try {
        const inputData = generateRandomFeatures();

        const response = await axios.post(FLASK_API_URL+'/predict', inputData);

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