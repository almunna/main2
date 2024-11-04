import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import imageRoutes from './routes/imageRoutes.js';
import path from 'path';
dotenv.config();


const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();

// Middleware
app.use(cors({
    origin: 'https://main2-2.onrender.com/', // Adjust to your frontend URL
    credentials: true, // Allow cookies to be sent
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json()); // Parse JSON bodies
app.use('/uploads', express.static('uploads')); // Serve static files from 'uploads' directory

// Configure session middleware
// Session configuration in server.js
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }), // Ensure MongoDB URI is correct
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Use secure cookies only in production
        httpOnly: true,
        sameSite: 'Lax', // or 'None' if working with cross-site cookies
    }
}));


// Use imageRoutes for handling registration and image upload
app.use('/api', imageRoutes); // Mounting imageRoutes

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

app.use(express.static(path.join(__dirname, "/virtualPhotobooth/dist")));
app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "virtualPhotobooth", "dist", "index.html"));
    })

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
