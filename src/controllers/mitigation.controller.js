import Alert from "../models/Alert.js";
import Mitigation from "../models/Mitigation.js";

export const mitigateAlert = async (req, res) => {
    try {
        const alertId = req.params.id;
        const userId = req.user._id;
        const { action } = req.body;

        const alert = await Alert.findOne({
            _id: alertId,
            user_id: userId
        });

        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        if (!["block", "isolate"].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        let mitigationStatus = "success";
        let message = "";

        if (action === "block") {
            message = "Device blocked successfully";
        } else if (action === "isolate") {
            message = "Device isolated successfully";
        }

        const mitigation = await Mitigation.create({
            performed_by: userId,
            action,
            target_ip: alert.src_ip || "unknown", 
            status: mitigationStatus
        });

        alert.status = "mitigated";
        await alert.save();

        return res.status(200).json({
            message,
            alert_id: alertId,
            action,
            mitigation_id: mitigation._id
        });

    } catch (error) {
        console.error("Error applying mitigation:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid alert ID" });
        }

        return res.status(500).json({ message: "Server error" });
    }
};

export const getMitigations = async (req, res) => {
    try {
        const userId = req.user._id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { performed_by: userId };

        if (req.query.status) filter.status = req.query.status;           
        if (req.query.action) filter.action = req.query.action;           

        const sort = req.query.sort || "-timestamp";

        const [actions, totalCount, summaryAgg] = await Promise.all([
            Mitigation.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select("_id timestamp action target_ip status"),

            Mitigation.countDocuments(filter),

            Mitigation.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        success: {
                            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] }
                        },
                        failed: {
                            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] }
                        },
                        block: {
                            $sum: { $cond: [{ $eq: ["$action", "block"] }, 1, 0] }
                        },
                        isolate: {
                            $sum: { $cond: [{ $eq: ["$action", "isolate"] }, 1, 0] }
                        }
                    }
                }
            ])
        ]);

        const summary =
            summaryAgg.length > 0
                ? summaryAgg[0]
                : {
                    total: 0,
                    success: 0,
                    failed: 0,
                    block: 0,
                    isolate: 0
                };

        return res.status(200).json({
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),

            actions,
            summary
        });
    } catch (error) {
        console.error("Error fetching mitigations:", error);
        return res.status(500).json({ error: "Server error" });
    }
};
