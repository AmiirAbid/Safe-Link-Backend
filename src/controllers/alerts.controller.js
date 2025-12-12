import Alert from "../models/Alert.js";

export const getAlerts = async (req, res) => {
    try {
        const userId = req.user._id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { user_id: userId };

        if (req.query.status) filter.status = req.query.status;
        if (req.query.severity) filter.severity = req.query.severity;

        const sort = req.query.sort || "-timestamp";

        const [alerts, totalAlerts] = await Promise.all([
            Alert.find(filter).sort(sort).skip(skip).limit(limit),
            Alert.countDocuments(filter)
        ]);

        return res.status(200).json({
            page,
            limit,
            totalAlerts,
            totalPages: Math.ceil(totalAlerts / limit),
            alerts
        });
    } catch (error) {
        console.error("Error fetching alerts:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

export const getAlert = async (req, res) => {
    try {
        const alertId = req.params.id;
        const userId = req.user._id;

        const alert = await Alert.findOne({
            _id: alertId,
            user_id: userId
        });

        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        return res.json(alert);

    } catch (error) {
        console.error("Error fetching alert:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid alert ID" });
        }

        res.status(500).json({ message: "Server error" });
    }
};
//
 export const deleteAlert = async (req, res) => {
    try {
        const alertId = req.params.id;
        const userId = req.user._id;

        const alert = await Alert.findOneAndDelete({
            _id: alertId,
            user_id: userId
        });

        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        return res.status(200).json({ message: "Alert deleted successfully" });

    } catch (error) {
        console.error("Error deleting alert:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid alert ID" });
        }

        return res.status(500).json({ message: "Server error" });
    }
};
