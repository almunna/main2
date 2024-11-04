import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import imageRoutes from './routes/imageRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
    origin: 'https://main2-2.onrender.com', // Frontend URL
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }), // Ensure MongoDB URI is correct
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        sameSite: 'Lax', // Use 'None' if cross-origin requests are required
    }
}));

// Routes
app.use('/api', imageRoutes);

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
