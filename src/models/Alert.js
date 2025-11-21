const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },

    src_ip: {
        type: String,
        required: true
    },

    dst_ip: {
        type: String,
        required: false
    },

    dst_port: {
        type: Number,
        required: false
    },

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

module.exports = mongoose.model("Alert", AlertSchema);
