// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/users.model.js'; // Pastikan path ini benar
import { JWT_SECRET } from '../config/jwt.js'; // Impor JWT_SECRET

// Middleware untuk melindungi route (memverifikasi JWT)
export const protect = async (req, res, next) => {
    let token;

    // 1. Cek apakah token ada di header Authorization (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]; // Ambil token dari "Bearer TOKEN"
    }
    // Opsi: Jika Anda juga mengirim token di cookie (untuk frontend yang lebih aman)
    // else if (req.cookies && req.cookies.jwt) {
    //     token = req.cookies.jwt;
    // }

    if (!token) {
        // Jika tidak ada token, user tidak terautentikasi
        return res.status(401).json({ message: 'Unauthorized: No token provided. Please log in.' });
    }

    try {
        // 2. Verifikasi token
        const decoded = jwt.verify(token, JWT_SECRET); // Verifikasi token menggunakan secret key

        // 3. Cari user berdasarkan ID dari token
        // Gunakan select('-password') agar password tidak ikut terambil
        req.user = await User.findById(decoded.id).select('-password'); 

        // Jika user tidak ditemukan (mungkin akun dihapus setelah token dibuat)
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: User no longer exists.' });
        }

        // Token valid dan user ditemukan, lanjutkan ke route handler berikutnya
        next();
    } catch (error) {
        // Tangani error verifikasi token (misal: token tidak valid, kadaluarsa)
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized: Token has expired. Please log in again.' });
        }
        console.error("JWT verification error:", error);
        return res.status(500).json({ message: 'Internal Server Error during authentication.' });
    }
};

// Opsional: Middleware untuk membatasi akses berdasarkan peran (misal: admin)
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) { // Asumsi ada field 'role' di User model
            return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action.' });
        }
        next();
    };
};