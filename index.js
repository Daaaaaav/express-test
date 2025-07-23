import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import mongoose from "mongoose";
import app from "./app.js"; 

const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/express-test'
mongoose.connect(mongoUrl)
    .then(() => {
        console.log('Database connected successfully!');
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((e) => {
        console.error('Error connecting to database:', e.message);
        process.exit(1);
    });