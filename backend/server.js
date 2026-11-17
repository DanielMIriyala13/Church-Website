const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Existing Routes
const eventRoutes = require('./routes/eventRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Church Management System Routes
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const prayerRoutes = require('./routes/prayerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://church-website.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive for production deployment ease
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers with sufficient limit for member photo uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check / Root route
app.get('/', (req, res) => {
    res.json({
        name: 'Bethesda Satyavakyam Church Management API',
        version: '2.0.0',
        status: 'Online',
        environment: process.env.NODE_ENV || 'development',
        documentation: {
            auth: '/api/auth',
            members: '/api/members',
            departments: '/api/departments',
            attendance: '/api/attendance',
            prayers: '/api/prayers',
            announcements: '/api/announcements',
            dashboard: '/api/dashboard/stats',
            verify: '/api/verify/:churchId'
        }
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/upload', uploadRoutes);

// Existing Legacy Website Routes
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contacts', contactRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Bethesda Church Management Server running on port ${PORT}`);
});
