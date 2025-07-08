// routers/user.js
import { Router } from "express";
import jwt from 'jsonwebtoken';
import User from "../models/users.model.js";
import passport from "../config/passport.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import nodemailer from "nodemailer";
import crypto from "crypto";

const router = Router();

const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(statusCode).json({
        status: 'success',
        token,
        user: userResponse,
    });
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "giovaldi8@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD
    }
});

router.post("/signup", async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required." });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            if (existingEmail.registerType === 'google') {
                return res.status(400).json({ message: "Email already registered via Google. Please log in with Google instead." });
            } else {
                return res.status(409).json({ message: "Email already registered." });
            }
        }

        let finalUsername = username;
        let counter = 1;

        while (await User.findOne({ username: finalUsername })) {
            finalUsername = `${username}${counter}`;
            counter++;
        }

        const user = await User.create({
            username: finalUsername,
            email,
            password,
            registerType: 'normal'
        });

        const message =
            finalUsername !== username
                ? `Username '${username}' was taken. You have been registered as '${finalUsername}'.`
                : undefined;

        createSendToken(user, 201, res);

    } catch (error) {
        console.error("Signup error:", error);

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                message: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists.`
            });
        }

        next(error);
    }
});


router.post("/login", (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
        if (err) {
            console.error("Passport authentication error:", err);
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: info.message || 'Login failed' });
        }

        createSendToken(user, 200, res);
    })(req, res, next);
});

router.post("/logout", (req, res, next) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error("Session destruction error on logout:", err);
                return next(err);
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: "Logged out successfully (session cleared)." });
        });
    } else {
        res.status(200).json({ message: "Logged out successfully." });
    }
});

router.get("/status", passport.authenticate('jwt', { session: false }), (req, res) => {
    const userResponse = req.user.toObject();
    delete userResponse.password;
    res.json({ loggedIn: true, user: userResponse });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Trigger Google OAuth with state=login
router.get('/google/login',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: 'login' 
  })
);

// Trigger Google OAuth with state=signup
router.get('/google/signup',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: 'signup' 
  })
);


router.get('/login/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:5173/auth/login?message=' + encodeURIComponent('Login failed. Please try again.')
  }),
  (req, res) => {
    if (!req.user) {
      return res.redirect('http://localhost:5173/auth/login?message=' + encodeURIComponent('Login failed. Please try again.'));
    }
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
  }
);



router.get('/signup/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:5173/auth/signup?message=' + encodeURIComponent('Email already registered. Please log in instead.')
  }),
  (req, res) => {
    if (!req.user) {
      return res.redirect('http://localhost:5173/auth/signup?message=' + encodeURIComponent('Signup failed. Email may already exist.'));
    }
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
  }
);



router.get("/users/:userId", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json({ status: "success", user });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }
        next(error);
    }
});

router.post("/send-email", async (req, res, next) => {
    const { to, subject, text, html } = req.body;
    try {
        if (!to || !subject || (!text && !html)) {
            return res.status(400).json({ success: false, message: "Recipient, subject, and either text or html content are required." });
        }

        await transporter.sendMail({
            from: "giovaldi8@gmail.com",
            to,
            subject,
            text,
            html
        });
        res.json({ success: true, message: "Email sent successfully!" });
    } catch (err) {
        console.error("Error sending email:", err);
        next(err);
    }
});

router.post('/forgot-password', async (req, res, next) => {
    let user;
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If a user with that email exists, a password reset email will be sent.' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `http://localhost:5173/reset-password/${resetToken}`;
        const message = `Anda menerima email ini karena Anda (atau orang lain) telah meminta reset kata sandi Anda.\n\n` +
                        `Silakan klik tautan ini untuk mereset kata sandi Anda: ${resetURL}\n\n` +
                        `Tautan ini akan kedaluwarsa dalam 10 menit. Jika Anda tidak meminta ini, abaikan email ini.`;

        await transporter.sendMail({
            from: "giovaldi8@gmail.com",
            to: user.email,
            subject: 'Reset Kata Sandi Anda',
            text: message
        });

        res.status(200).json({
            status: 'success',
            message: 'Jika pengguna dengan email tersebut ada, email reset kata sandi akan dikirim.'
        });

    } catch (err) {
        if (user) { 
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }
        console.error("Error sending reset password email:", err);
        return next(err);
    }
});

router.post('/reset-password/:token', async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'New password is required.' });
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        createSendToken(user, 200, res);

    } catch (err) {
        console.error("Error resetting password:", err);
        next(err);
    }
});

export default router;