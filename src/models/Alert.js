import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    },

    src_ip: {
        type: String,
        required: true
    },

    dst_ip: String,
    dst_port: Number,

    attack_type: {
        type: String,
        required: true
    },

    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        required: true
    },

    confidence: {
        type: Number,
        default: 0.0
    },

    status: {
        type: String,
        enum: ["open", "mitigated", "ignored"],
        default: "open"
    },

    mitigation_action: {
        type: String,
        enum: ["block", "isolate", null],
        default: null
    }
});

const Alert = mongoose.model("Alert", AlertSchema);
export default Alert;
