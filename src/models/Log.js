const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
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

    protocol: {
        type: String,
        enum: ["TCP", "UDP", "ICMP"],
        required: true
    },

    dst_port: {
        type: Number,
        required: false
    },

    packets: {
        type: Number,
        default: 0
    },

    bytes: {
        type: Number,
        default: 0
    },

    flags: {
        syn: { type: Number, default: 0 },
        ack: { type: Number, default: 0 },
        fin: { type: Number, default: 0 }
    },

    flow_duration: {
        type: Number,
        default: 0 // in milliseconds
    }
});

module.exports = mongoose.model("Log", LogSchema);
