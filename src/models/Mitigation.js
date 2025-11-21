import mongoose from "mongoose";

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

const Mitigation = mongoose.model("Mitigation", MitigationSchema);
export default Mitigation;