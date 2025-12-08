import Alert from "../models/Alert.js";

export const getAlerts = async (req, res) => {
    try {
        const userId = req.user._id;

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter by user
        const filter = { user_id: userId };

        // Optional filters
        if (req.query.status) filter.status = req.query.status;
        if (req.query.severity) filter.severity = req.query.severity;

        // Optional sorting: ?sort=-timestamp / ?sort=severity
        const sort = req.query.sort || "-timestamp";

        // Fetch paginated alerts
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
