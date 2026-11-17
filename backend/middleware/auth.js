const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'bethesda_church_jwt_secret_key_2026_secure';

// Protect middleware - checks for valid JWT
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password').populate('member');

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found or deleted.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'User account has been deactivated.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth verification error:', error.message);
        return res.status(401).json({ success: false, message: 'Token is invalid or expired.' });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource.`
            });
        }
        next();
    };
};

// Optional auth - extracts user if token provided, but doesn't block guests
const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password').populate('member');
        if (user && user.isActive) {
            req.user = user;
        }
    } catch (err) {
        // Silently continue for guests
    }
    next();
};

module.exports = {
    protect,
    authorize,
    optionalAuth,
    JWT_SECRET
};
