import express from 'express';
import multer from 'multer';
import path, { dirname } from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import getEmployeeModel from '../utils/getEmployeeModel.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();
const router = express.Router();

// Directory setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const department = req.session.department;
        console.log("Session Department:", department); // Log department for debugging

        if (!department) return cb(new Error('Department is missing from session'));

        const dir = path.join('uploads', department);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Middleware to verify session data
const ensureRegistrationData = (req, res, next) => {
    const { name, email, department } = req.session;
    console.log("Session Data on Upload:", req.session);

    if (!name || !email || !department) {
        return res.status(400).json({ error: 'Please register before uploading images.' });
    }
    next();
};

// Registration route
router.post('/register', (req, res) => {
    const { name, email, department } = req.body;

    if (!name || !email || !department) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    req.session.name = name;
    req.session.email = email;
    req.session.department = department;

    req.session.save((err) => {
        if (err) return res.status(500).json({ error: 'Failed to save session data' });
        console.log('Session data after registration:', req.session); // Log session for debugging
        res.status(200).json({ message: 'Registration successful' });
    });
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Email function
const sendEmail = (to, subject, text, imagePath) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        attachments: [
            { filename: 'captured_image.png', path: imagePath },
        ],
    };
    return transporter.sendMail(mailOptions);
};

// Image upload route
router.post('/upload', ensureRegistrationData, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });

    try {
        const EmployeeModel = getEmployeeModel(req.session.department);
        const imagePath = req.file.path;

        const newEmployee = new EmployeeModel({
            name: req.session.name,
            email: req.session.email,
            department: req.session.department,
            imagePath
        });

        const savedEmployee = await newEmployee.save();

        const emailSubject = 'Your Captured Image';
        const emailText = `Hi ${req.session.name},\n\nThank you for using the Virtual Photobooth! Attached is your photo.\n\nBest regards,\nVirtual Photobooth`;
        await sendEmail(req.session.email, emailSubject, emailText, imagePath);

        res.status(200).json({ message: 'Image uploaded and data saved successfully!', data: savedEmployee });
    } catch (error) {
        console.error('Error processing upload:', error.message);
        res.status(500).json({ error: `An error occurred while processing the image: ${error.message}` });
    }
});

export default router;
