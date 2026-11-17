const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// @route   GET /api/announcements
// @desc    Get published announcements (Public Show Page)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category, priority, limit = 20 } = req.query;
        const now = new Date();

        const query = {
            isActive: true,
            status: 'published',
            publishDate: { $lte: now }
        };

        if (category && category !== 'All') {
            query.category = category;
        }

        if (priority) {
            query.priority = priority;
        }

        const announcements = await Announcement.find(query)
            .sort({ priority: -1, createdAt: -1 })
            .limit(Number(limit));

        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/announcements/admin/all
// @desc    Get all announcements including drafts, scheduled, archived (Management)
// @access  Private (Staff/Admins/Pastors/Dept Heads)
router.get('/admin/all', protect, authorize('Super Admin', 'Church Admin', 'Pastor', 'Department Head'), async (req, res) => {
    try {
        const { status, category, search } = req.query;
        const query = {};

        if (status && status !== 'All') {
            query.status = status;
        }
        if (category && category !== 'All') {
            query.category = category;
        }
        if (search) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ title: regex }, { content: regex }];
        }

        const announcements = await Announcement.find(query)
            .populate('author', 'churchId')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: announcements.length, announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/announcements/:id
// @desc    Get single announcement
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/announcements
// @desc    Create announcement
// @access  Private (Staff/Admins/Pastors/Dept Heads)
router.post('/', optionalAuth, async (req, res) => {
    try {
        const {
            title,
            content,
            category,
            priority,
            posterUrl,
            publishDate,
            expiryDate,
            status,
            targetAudience
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required.' });
        }

        const announcement = new Announcement({
            title,
            content,
            category: category || 'General',
            priority: priority || 'medium',
            posterUrl: posterUrl || '',
            publishDate: publishDate ? new Date(publishDate) : new Date(),
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            status: status || 'published',
            targetAudience: targetAudience || 'All',
            author: req.user ? req.user._id : undefined,
            isActive: true
        });

        const newAnnouncement = await announcement.save();

        if (req.user) {
            await AuditLog.create({
                action: 'ANNOUNCEMENT_CREATED',
                entity: 'Announcement',
                entityId: newAnnouncement._id.toString(),
                performedBy: req.user.churchId,
                role: req.user.role,
                details: { title }
            }).catch(err => console.error(err.message));
        }

        res.status(201).json(newAnnouncement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private (Staff/Admins/Pastors/Dept Heads)
router.put('/:id', protect, authorize('Super Admin', 'Church Admin', 'Pastor', 'Department Head'), async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        res.json(announcement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   PUT /api/announcements/:id/status
// @desc    Quick status change (publish, schedule, archive)
// @access  Private (Staff/Admins/Pastors/Dept Heads)
router.put('/:id/status', protect, authorize('Super Admin', 'Church Admin', 'Pastor', 'Department Head'), async (req, res) => {
    try {
        const { status } = req.body;
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

        announcement.status = status;
        if (status === 'archived') {
            announcement.isActive = false;
        } else {
            announcement.isActive = true;
        }

        const updated = await announcement.save();
        res.json({ success: true, message: `Announcement set to ${status}`, announcement: updated });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Super Admin, Church Admin, Pastor)
router.delete('/:id', protect, authorize('Super Admin', 'Church Admin', 'Pastor'), async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
