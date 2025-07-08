// app.js
import express from 'express';
import postRouter from './routers/post.js';
import cors from 'cors';
import userRouter from './routers/user.js';
import session from "express-session";
import MongoStore from 'connect-mongo';
import passport from './config/passport.js';
// dotenv tidak perlu diimpor lagi di sini karena sudah di index.js
// import dotenv from 'dotenv'; // Hapus ini jika diimpor di index.js

// dotenv.config({ path: './.env' }); // Hapus ini jika sudah di index.js

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'giovaldi_super_secret_key_random_string_xyz123',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/express-test",
            ttl: 24 * 60 * 60,
            autoRemove: 'interval',
            autoRemoveInterval: 10
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        }
    })
);

app.use(passport.initialize());

app.use('/posts', postRouter);
app.use('/auth', userRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    if (['AuthenticationError', 'UnauthorizedError', 'JsonWebTokenError', 'TokenExpiredError'].includes(err.name)) {
        return res.status(401).json({ message: err.message || 'Authentication failed.' });
    }
    res.status(500).json({ message: err.message || 'Something went wrong!' });
});

export default app;