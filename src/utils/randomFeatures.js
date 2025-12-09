export const FEATURE_RANGES = {
    // Packet Lengths (0–3000 normally)
    "Fwd Packet Length Min": [0, 1500],
    "Fwd Packet Length Mean": [200, 2000],
    "Fwd Packet Length Max": [300, 3000],

    "Bwd Packet Length Min": [0, 1500],
    "Bwd Packet Length Mean": [200, 2000],
    "Bwd Packet Length Max": [300, 3000],

    // Inter-arrival times (0–3000)
    "Flow IAT Mean": [0, 3000],
    "Flow IAT Min": [0, 3000],
    "Flow IAT Max": [0, 4000],
    "Flow IAT Std": [0, 3500],

    "Fwd IAT Total": [0, 8000],
    "Fwd IAT Mean": [0, 3000],
    "Fwd IAT Min": [0, 2000],
    "Fwd IAT Max": [0, 4000],
    "Fwd IAT Std": [0, 3500],

    "Bwd IAT Total": [0, 8000],
    "Bwd IAT Mean": [0, 3000],
    "Bwd IAT Min": [0, 2000],
    "Bwd IAT Max": [0, 4000],
    "Bwd IAT Std": [0, 3500],

    // Active / Idle times
    "Active Mean": [0, 4000],
    "Active Std": [0, 4000],
    "Active Max": [0, 4000],
    "Active Min": [0, 4000],

    "Idle Mean": [0, 4000],
    "Idle Std": [0, 4000],
    "Idle Max": [0, 4000],
    "Idle Min": [0, 4000],

    // Averages
    "Pkt Size Avg": [0, 2000],
    "Fwd Seg Size Avg": [0, 500],
    "Bwd Seg Size Avg": [0, 500],

    // Subflow bytes
    "Subflow Fwd Bytes": [0, 4000],
    "Subflow Bwd Bytes": [0, 4000],

    // Window sizes
    "Init Fwd Win Bytes": [0, 4000],
    "Init Bwd Win Bytes": [0, 4000],

    // Headers
    "Fwd Header Length": [0, 1000],
    "Bwd Header Length": [0, 3000],

    // Ports
    "Destination Port": [1, 65535],

    // Flow stats
    "Flow Duration": [0, 5000],
    "Total Fwd Packets": [0, 3000],
    "Total Backward Packets": [0, 3000],
    "Total Length of Fwd Packets": [0, 4000],
    "Total Length of Bwd Packets": [0, 4000],

    // Std devs
    "Fwd Packet Length Std": [0, 3000],
    "Bwd Packet Length Std": [0, 3000],

    // Rates
    "Flow Bytes/s": [0, 5000],
    "Flow Packets/s": [0, 3000],
    "Fwd Packets/s": [0, 2000],

    // Flags (usually 0 or 1, but your data uses large numeric encodings)
    "Fwd PSH Flags": [0, 3000],
    "Fwd URG Flags": [0, 3000]
};

// Generate a random number within range
function randRange(min, max) {
    return Number((Math.random() * (max - min) + min).toFixed(3));
}

// Generate a complete feature object
export function generateRandomFeatures() {
    const output = {};

    for (const [feature, [min, max]] of Object.entries(FEATURE_RANGES)) {
        output[feature] = randRange(min, max);
    }

    return output;
}
