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

    created_at: {
        type: Date,
        default: Date.now
    }
});

// 🔐 Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password_hash")) return next();
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
    next();
});

// 🔐 Compare password method
UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
};

const User = mongoose.model("User", UserSchema);
export default User;