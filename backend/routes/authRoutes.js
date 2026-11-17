const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Member = require('../models/Member');
const AuditLog = require('../models/AuditLog');
const { protect, authorize, JWT_SECRET } = require('../middleware/auth');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            churchId: user.churchId,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @route   POST /api/auth/login
// @desc    Authenticate user by Church ID (or email) & password
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { identifier, churchId, password } = req.body;
        const loginId = (churchId || identifier || '').trim();

        if (!loginId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide Church ID and password.'
            });
        }

        // Search by churchId (case-insensitive) or email
        const user = await User.findOne({
            $or: [
                { churchId: new RegExp(`^${loginId}$`, 'i') },
                { email: loginId.toLowerCase() }
            ]
        }).populate('member');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Church ID or password.'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact church administration.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Church ID or password.'
            });
        }

        user.lastLogin = new Date();
        await user.save();

        // Log audit
        await AuditLog.create({
            action: 'USER_LOGIN',
            entity: 'User',
            entityId: user._id.toString(),
            performedBy: user.churchId,
            role: user.role,
            details: { loginTime: user.lastLogin }
        }).catch(err => console.error('AuditLog error:', err.message));

        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                churchId: user.churchId,
                email: user.email,
                role: user.role,
                member: user.member,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('member');
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
    }
});

// @route   POST /api/auth/change-password
// @desc    Change logged-in user password
// @access  Private
router.post('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long.'
            });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password does not match.'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error updating password.' });
    }
});

// @route   POST /api/auth/create-user
// @desc    Create login account for an existing member (Admin only)
// @access  Private (Super Admin, Church Admin)
router.post('/create-user', protect, authorize('Super Admin', 'Church Admin'), async (req, res) => {
    try {
        const { churchId, email, password, role, memberId } = req.body;

        if (!churchId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Church ID and password are required.'
            });
        }

        const existingUser = await User.findOne({ churchId: churchId.toUpperCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: `Account already exists for Church ID ${churchId}.`
            });
        }

        let memberObj = null;
        if (memberId) {
            memberObj = await Member.findById(memberId);
        } else {
            memberObj = await Member.findOne({ churchId: churchId.toUpperCase() });
        }

        const user = new User({
            churchId: churchId.toUpperCase(),
            email: email || (memberObj ? memberObj.email : undefined),
            password,
            role: role || 'Church Member',
            member: memberObj ? memberObj._id : undefined
        });

        await user.save();

        await AuditLog.create({
            action: 'USER_CREATED',
            entity: 'User',
            entityId: user._id.toString(),
            performedBy: req.user.churchId,
            role: req.user.role,
            details: { targetChurchId: user.churchId, assignedRole: user.role }
        }).catch(err => console.error(err.message));

        res.status(201).json({
            success: true,
            message: `User account created successfully for ${user.churchId}.`,
            user: {
                _id: user._id,
                churchId: user.churchId,
                role: user.role,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/auth/users
// @desc    List all system users (Admin only)
// @access  Private (Super Admin, Church Admin)
router.get('/users', protect, authorize('Super Admin', 'Church Admin'), async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('member', 'fullName phone email membershipStatus department photo')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/auth/users/:id/role
// @desc    Update user role or status (Super Admin only)
// @access  Private (Super Admin)
router.put('/users/:id/role', protect, authorize('Super Admin'), async (req, res) => {
    try {
        const { role, isActive, newPassword } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;
        if (newPassword && newPassword.length >= 6) {
            user.password = newPassword;
        }

        await user.save();

        res.json({
            success: true,
            message: `User ${user.churchId} updated successfully.`,
            user: {
                _id: user._id,
                churchId: user.churchId,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/auth/setup-initial-admin
// @desc    Initialize Super Admin account if no users exist
// @access  Public (only when DB has 0 users)
router.post('/setup-initial-admin', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'System already has registered administrative users.'
            });
        }

        const { churchId, password, fullName, phone, email } = req.body;

        const adminChurchId = (churchId || 'BSC-2026-0001').toUpperCase().trim();
        const adminPass = password || 'Admin@2026';

        // Also create a church member profile for this admin
        let member = await Member.findOne({ churchId: adminChurchId });
        if (!member) {
            member = await Member.create({
                churchId: adminChurchId,
                fullName: fullName || 'Senior Pastor & Super Admin',
                phone: phone || '+91 9876543210',
                email: email || 'admin@bethesdacms.org',
                membershipStatus: 'Active',
                joiningDate: new Date('2000-01-01')
            });
        }

        const superAdmin = await User.create({
            churchId: adminChurchId,
            email: email || 'admin@bethesdacms.org',
            password: adminPass,
            role: 'Super Admin',
            member: member._id,
            isActive: true
        });

        const token = generateToken(superAdmin);

        res.status(201).json({
            success: true,
            message: 'Super Admin successfully initialized!',
            token,
            user: {
                _id: superAdmin._id,
                churchId: superAdmin.churchId,
                role: superAdmin.role,
                email: superAdmin.email,
                member
            }
        });
    } catch (error) {
        console.error('Initial admin setup error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

