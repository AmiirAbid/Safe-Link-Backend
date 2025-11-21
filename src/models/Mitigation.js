const mongoose = require("mongoose");

const MitigationSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },

    performed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    action: {
        type: String,
        enum: ["block", "isolate"],
        required: true
    },

    target_ip: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["success", "failed"],
        default: "success"
    }
});

module.exports = mongoose.model("Mitigation", MitigationSchema);
