import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import statusRoute from "./routes/status.route.js";
import alertsRoute from "./routes/alerts.route.js";
import scanRoute from "./routes/scan.route.js";
import logsRoute from "./routes/log.route.js";
import mitigationsRoute from "./routes/mitigations.route.js";

// Load env variables
dotenv.config();

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();

// Routes
app.use("/", statusRoute);
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertsRoute);
app.use("/api/mitigations", mitigationsRoute);
app.use("/api/scan", scanRoute);
app.use("/api/logs", logsRoute);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
