import Log from "../models/Log.js";

/**
 * GET /logs
 * Retourne les logs réseau avec pagination et filtres optionnels
 */
export const getLogs = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filtrage optionnel par protocole ou IP
        const filter = {};
        if (req.query.protocol) filter.protocol = req.query.protocol.toUpperCase();
        if (req.query.src_ip) filter.src_ip = req.query.src_ip;
        if (req.query.dst_ip) filter.dst_ip = req.query.dst_ip;

        // Récupérer les logs avec pagination
        const [logs, total] = await Promise.all([
            Log.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit),
            Log.countDocuments(filter)
        ]);

        if (!logs || logs.length === 0) {
            return res.status(404).json({ message: "No logs found for the given filters" });
        }

        return res.status(200).json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
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

