import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    // Email-based 2FA Fields
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },

    twoFactorCode: {
        type: String,
        default: null
    },

    twoFactorCodeExpiry: {
        type: Date,
        default: null
    },

    created_at: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;