// models/users.model.js
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto"; // <-- Import crypto module

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please fill a valid email address"]
        },
        password: {
            type: String,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },
        registerType: {
            type: String,
            enum: ['normal', 'google'],
            default: 'normal',
            required: true
        },
        socialId: {
            type: String,
            unique: true,
            sparse: true
        },
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
        // --- TAMBAHAN UNTUK RESET PASSWORD ---
        passwordResetToken: String,
        passwordResetExpires: Date
        // --- AKHIR TAMBAHAN ---
    },
    {
        timestamps: true
    }
);

// Middleware pre-save untuk menghash password dan menangani required secara kondisional
UserSchema.pre("save", async function (next) {
    // Hanya hash password jika dimodifikasi atau baru dibuat dan bukan social login tanpa password
    if (this.password && this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    // Jika registerType adalah 'normal' DAN password tidak ada, lemparkan error
    if (this.registerType === 'normal' && (!this.password || this.password === '')) {
        return next(new Error('Password is required for normal registration.'));
    }
    next();
});

// --- Metode untuk menghasilkan token reset password ---
UserSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token sebelum menyimpannya di database
    // Ini untuk mencegah brute-force attack jika database bocor
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Token akan kedaluwarsa dalam 10 menit
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 menit dalam milidetik

    return resetToken; // Kembalikan token yang tidak di-hash untuk dikirim ke email
};


const User = mongoose.model("User", UserSchema);
export default User;