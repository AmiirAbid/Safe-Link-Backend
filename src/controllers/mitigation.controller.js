import Alert from "../models/Alert.js";
import Mitigation from "../models/Mitigation.js";

export const mitigateAlert = async (req, res) => {
    try {
        const alertId = req.params.id;
        const userId = req.user._id;
        const { action } = req.body;

        // 1️⃣ Vérifier que l'alerte existe et appartient à l'utilisateur
        const alert = await Alert.findOne({
            _id: alertId,
            user_id: userId
        });

        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        // 2️⃣ Vérifier que l'action est valide (block / isolate)
        if (!["block", "isolate"].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        // 3️⃣ Simulation de mitigation (à remplacer par ton vrai module plus tard)
        let mitigationStatus = "success";
        let message = "";

        if (action === "block") {
            message = "Device blocked successfully";
        } else if (action === "isolate") {
            message = "Device isolated successfully";
        }

        // 4️⃣ Créer un enregistrement dans la collection Mitigation
        const mitigation = await Mitigation.create({
            performed_by: userId,
            action,
            target_ip: alert.source_ip || "unknown", // dépend de ton modèle Alert
            status: mitigationStatus
        });

        // 5️⃣ (Optionnel) Mettre à jour l'alerte comme "mitigated"
        alert.status = "mitigated";
        await alert.save();

        // 6️⃣ Retour conforme Swagger
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
