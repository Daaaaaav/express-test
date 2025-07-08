
// src/config/jwt.js

// Secret key untuk menandatangani JWT. Ganti dengan string acak yang kuat.
// Pastikan ini disimpan di variabel lingkungan (misal di file .env).
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this';

// Waktu kedaluwarsa JWT (misal: '1h', '7d', '30m').
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Waktu kedaluwarsa refresh token (jika digunakan, lebih panjang dari access token)
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';