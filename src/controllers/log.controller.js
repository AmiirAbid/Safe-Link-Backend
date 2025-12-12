import Log from "../models/Log.js";

export const getLogs = async (req, res) => {
    try {
        const filter = {};

        // Optional filters
        if (req.query.protocol) filter.protocol = req.query.protocol.toUpperCase();
        if (req.query.src_ip) filter.src_ip = req.query.src_ip;
        if (req.query.dst_ip) filter.dst_ip = req.query.dst_ip;

        // Optional duration filter: ?days=7  → last 7 days
        if (req.query.days) {
            const days = parseInt(req.query.days);
            if (!isNaN(days) && days > 0) {
                const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                filter.timestamp = { $gte: cutoff };
            }
        }

        const logs = await Log.find(filter).sort({ timestamp: -1 });

        if (!logs || logs.length === 0) {
            return res.status(404).json({ message: "No logs found for the given filters" });
        }

        return res.status(200).json({
            total: logs.length,
            data: logs
        });

    } catch (error) {
        console.error("Error fetching logs:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /logs/:id
 * Retourne un log spécifique par son ID
 */
export const getLogById = async (req, res) => {
    try {
        const logId = req.params.id;
        const log = await Log.findById(logId);

        if (!log) {
            return res.status(404).json({ message: "Log not found" });
        }

        return res.status(200).json(log);

    } catch (error) {
        console.error("Error fetching log:", error);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid log ID" });
        }
        return res.status(500).json({ message: "Server error" });
    }
};

