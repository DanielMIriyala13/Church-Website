const express = require('express');
const router = express.Router();
const PrayerRequest = require('../models/PrayerRequest');
const AuditLog = require('../models/AuditLog');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

// @route   POST /api/prayers
// @desc    Submit a prayer request (Public & Logged-in users)
// @access  Public / Optional Auth
router.post('/', optionalAuth, async (req, res) => {
    try {
        const {
            title,
            request,
            requesterName,
            requesterPhone,
            requesterEmail,
            isAnonymous,
            privacyLevel
        } = req.body;

        if (!title || !request) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both title and prayer request description.'
            });
        }

        const validPrivacy = ['Public', 'Prayer Team', 'Pastor Only', 'Private'];
        const selectedPrivacy = validPrivacy.includes(privacyLevel) ? privacyLevel : 'Public';

        const newPrayer = new PrayerRequest({
            title,
            request,
            requesterName: isAnonymous ? 'Anonymous' : (requesterName || (req.user ? (req.user.member ? req.user.member.fullName : req.user.churchId) : 'Visitor')),
            requesterPhone: isAnonymous ? '' : (requesterPhone || ''),
            requesterEmail: isAnonymous ? '' : (requesterEmail || ''),
            isAnonymous: Boolean(isAnonymous),
            privacyLevel: selectedPrivacy,
            status: 'Pending',
            submittedBy: req.user ? req.user._id : undefined
        });

        const saved = await newPrayer.save();

        res.status(201).json({
            success: true,
            message: 'Your prayer request has been received. Our prayer team and pastors are praying for you.',
            prayer: {
                _id: saved._id,
                title: saved.title,
                privacyLevel: saved.privacyLevel,
                status: saved.status,
                createdAt: saved.createdAt
            }
        });
    } catch (error) {
        console.error('Prayer submission error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/prayers/public
// @desc    Get public prayer requests (approved/public only)
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const prayers = await PrayerRequest.find({
            privacyLevel: 'Public'
        })
            .select('title request requesterName isAnonymous status answeredTestimony createdAt')
            .sort({ createdAt: -1 })
            .limit(50);

        // Sanitize anonymous names
        const sanitized = prayers.map(p => ({
            _id: p._id,
            title: p.title,
            request: p.request,
            requesterName: p.isAnonymous ? 'Anonymous Church Member' : p.requesterName,
            status: p.status,
            answeredTestimony: p.answeredTestimony,
            createdAt: p.createdAt
        }));

        res.json({ success: true, count: sanitized.length, prayers: sanitized });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/prayers/management
// @desc    Get prayers based on role permissions
// @access  Private
// Super Admin & Pastor: Can view ALL (Public, Prayer Team, Pastor Only, Private)
// Church Admin: Public, Prayer Team, Private
// Department Head / Staff: Public, Prayer Team
// Church Member: Own prayers only + Public
router.get('/management', protect, async (req, res) => {
    try {
        const { status, privacyLevel, search } = req.query;
        let query = {};

        const userRole = req.user.role;

        if (['Super Admin', 'Pastor'].includes(userRole)) {
            // Full access to all privacy levels
            if (privacyLevel) query.privacyLevel = privacyLevel;
        } else if (userRole === 'Church Admin') {
            // Everything except confidential 'Pastor Only' unless explicitly granted
            query.privacyLevel = { $in: ['Public', 'Prayer Team', 'Private'] };
            if (privacyLevel && ['Public', 'Prayer Team', 'Private'].includes(privacyLevel)) {
                query.privacyLevel = privacyLevel;
            }
        } else if (userRole === 'Department Head') {
            // Public and Prayer Team
            query.privacyLevel = { $in: ['Public', 'Prayer Team'] };
            if (privacyLevel && ['Public', 'Prayer Team'].includes(privacyLevel)) {
                query.privacyLevel = privacyLevel;
            }
        } else {
            // Church Member: only their own submissions or public
            query = {
                $or: [
                    { submittedBy: req.user._id },
                    { privacyLevel: 'Public' }
                ]
            };
        }

        if (status) {
            query.status = status;
        }

        if (search) {
            const regex = new RegExp(search.trim(), 'i');
            query.$and = query.$and || [];
            query.$and.push({
                $or: [{ title: regex }, { request: regex }, { requesterName: regex }]
            });
        }

        const prayers = await PrayerRequest.find(query)
            .populate('submittedBy', 'churchId email')
            .populate('assignedTo', 'churchId')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: prayers.length, prayers });
    } catch (error) {
        console.error('Fetch prayers error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/prayers/:id/status
// @desc    Update prayer request status or pastor notes
// @access  Private (Staff/Admins/Pastors)
router.put('/:id/status', protect, authorize('Super Admin', 'Church Admin', 'Pastor', 'Department Head'), async (req, res) => {
    try {
        const { status, answeredTestimony, pastorNotes, assignedTo } = req.body;
        const prayer = await PrayerRequest.findById(req.params.id);

        if (!prayer) {
            return res.status(404).json({ success: false, message: 'Prayer request not found.' });
        }

        if (status) prayer.status = status;
        if (answeredTestimony !== undefined) prayer.answeredTestimony = answeredTestimony;
        if (pastorNotes !== undefined) prayer.pastorNotes = pastorNotes;
        if (assignedTo !== undefined) prayer.assignedTo = assignedTo || null;

        const updated = await prayer.save();

        res.json({
            success: true,
            message: `Prayer request marked as ${updated.status}.`,
            prayer: updated
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/prayers/:id
// @desc    Delete prayer request
// @access  Private (Super Admin, Church Admin)
router.delete('/:id', protect, authorize('Super Admin', 'Church Admin', 'Pastor'), async (req, res) => {
    try {
        const prayer = await PrayerRequest.findByIdAndDelete(req.params.id);
        if (!prayer) {
            return res.status(404).json({ success: false, message: 'Prayer request not found.' });
        }
        res.json({ success: true, message: 'Prayer request deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
