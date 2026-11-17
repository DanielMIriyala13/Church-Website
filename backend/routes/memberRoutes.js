const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const User = require('../models/User');
const ChurchIdCounter = require('../models/ChurchIdCounter');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/members
// @desc    Get all members with search, filter, pagination
// @access  Private (Staff/Admins/Pastors)
router.get('/', protect, async (req, res) => {
    try {
        const { search, department, status, gender, page = 1, limit = 50 } = req.query;
        const query = {};

        if (search) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { fullName: regex },
                { churchId: regex },
                { phone: regex },
                { email: regex }
            ];
        }

        if (department) {
            query.department = department;
        }

        if (status) {
            query.membershipStatus = status;
        }

        if (gender) {
            query.gender = gender;
        }

        // If user is a Church Member (not staff/pastor), only allow viewing own profile or basic public directory
        const skip = (Number(page) - 1) * Number(limit);

        const total = await Member.countDocuments(query);
        const members = await Member.find(query)
            .populate('department', 'name code color')
            .sort({ churchId: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            members
        });
    } catch (error) {
        console.error('Fetch members error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/members/stats
// @desc    Get member statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const totalMembers = await Member.countDocuments();
        const activeMembers = await Member.countDocuments({ membershipStatus: 'Active' });
        const inactiveMembers = await Member.countDocuments({ membershipStatus: { $ne: 'Active' } });

        const genderDistribution = await Member.aggregate([
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);

        const statusDistribution = await Member.aggregate([
            { $group: { _id: '$membershipStatus', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalMembers,
                activeMembers,
                inactiveMembers,
                genderDistribution,
                statusDistribution
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/members/next-id
// @desc    Preview the next available Church ID
// @access  Private (Admins/Pastors)
router.get('/next-id', protect, authorize('Super Admin', 'Church Admin', 'Pastor'), async (req, res) => {
    try {
        const year = new Date().getFullYear();
        const counter = await ChurchIdCounter.findOne({ year });
        const nextSeq = counter ? counter.lastSequence + 1 : 1;
        const candidateId = `BSC-${year}-${String(nextSeq).padStart(4, '0')}`;
        res.json({ success: true, nextId: candidateId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/members/:id
// @desc    Get member by MongoDB ID or Church ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const id = req.params.id;
        let member;

        if (id.startsWith('BSC-')) {
            member = await Member.findOne({ churchId: id.toUpperCase() }).populate('department');
        } else {
            member = await Member.findById(id).populate('department');
        }

        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found.' });
        }

        res.json({ success: true, member });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/members
// @desc    Register a new Church Member with auto-generated Church ID
// @access  Private (Super Admin, Church Admin, Pastor)
router.post('/', protect, authorize('Super Admin', 'Church Admin', 'Pastor'), async (req, res) => {
    try {
        const {
            fullName,
            photo,
            phone,
            email,
            address,
            dateOfBirth,
            gender,
            bloodGroup,
            joiningDate,
            department,
            membershipStatus,
            emergencyContact,
            notes,
            customChurchId,
            createLogin,
            initialPassword
        } = req.body;

        if (!fullName || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Full name and phone number are required.'
            });
        }

        let assignedChurchId;

        if (customChurchId && customChurchId.trim()) {
            assignedChurchId = customChurchId.trim().toUpperCase();
            // Check for duplicates
            const existing = await Member.findOne({ churchId: assignedChurchId });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: `Church ID ${assignedChurchId} is already in use.`
                });
            }
        } else {
            // Automatically generate unique Church ID (BSC-YYYY-XXXX)
            assignedChurchId = await ChurchIdCounter.getNextChurchId('BSC', new Date().getFullYear());
            // Double-check no collision
            let exists = await Member.findOne({ churchId: assignedChurchId });
            while (exists) {
                assignedChurchId = await ChurchIdCounter.getNextChurchId('BSC', new Date().getFullYear());
                exists = await Member.findOne({ churchId: assignedChurchId });
            }
        }

        const newMember = new Member({
            churchId: assignedChurchId,
            fullName,
            photo: photo || '',
            phone,
            email: email || '',
            address: address || {},
            dateOfBirth: dateOfBirth || undefined,
            gender: gender || 'Male',
            bloodGroup: bloodGroup || 'Unknown',
            joiningDate: joiningDate || Date.now(),
            department: department || undefined,
            membershipStatus: membershipStatus || 'Active',
            emergencyContact: emergencyContact || {},
            notes: notes || ''
        });

        const savedMember = await newMember.save();

        // Optionally create user account for login
        let userCreated = null;
        if (createLogin) {
            const password = initialPassword || 'Member@2026';
            const user = new User({
                churchId: assignedChurchId,
                email: email || undefined,
                password,
                role: 'Church Member',
                member: savedMember._id
            });
            await user.save();
            userCreated = { churchId: user.churchId, role: user.role };
        }

        await AuditLog.create({
            action: 'MEMBER_REGISTERED',
            entity: 'Member',
            entityId: savedMember._id.toString(),
            performedBy: req.user.churchId,
            role: req.user.role,
            details: { churchId: assignedChurchId, fullName }
        }).catch(err => console.error(err.message));

        res.status(201).json({
            success: true,
            message: `Member registered successfully with ID: ${assignedChurchId}`,
            member: savedMember,
            userCreated
        });
    } catch (error) {
        console.error('Member creation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/members/:id
// @desc    Update member profile
// @access  Private (Admins, Pastors, or own member)
router.put('/:id', protect, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found.' });
        }

        // Only allow staff/admin or the user themselves to edit
        const isSelf = req.user.member && req.user.member._id.toString() === member._id.toString();
        const isStaff = ['Super Admin', 'Church Admin', 'Pastor'].includes(req.user.role);

        if (!isSelf && !isStaff) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this member profile.' });
        }

        const allowedUpdates = [
            'fullName', 'photo', 'phone', 'email', 'address', 'dateOfBirth',
            'gender', 'bloodGroup', 'emergencyContact', 'notes'
        ];

        // Only staff can update department, membershipStatus or joiningDate
        if (isStaff) {
            allowedUpdates.push('department', 'membershipStatus', 'joiningDate');
        }

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                member[field] = req.body[field];
            }
        });

        const updated = await member.save();

        await AuditLog.create({
            action: 'MEMBER_UPDATED',
            entity: 'Member',
            entityId: member._id.toString(),
            performedBy: req.user.churchId,
            role: req.user.role,
            details: { updatedFields: Object.keys(req.body) }
        }).catch(err => console.error(err.message));

        res.json({
            success: true,
            message: 'Member profile updated successfully.',
            member: updated
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/members/:id
// @desc    Delete member record
// @access  Private (Super Admin, Church Admin)
router.delete('/:id', protect, authorize('Super Admin', 'Church Admin'), async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found.' });
        }

        // Also delete associated User account if any
        await User.findOneAndDelete({ churchId: member.churchId });
        await Member.findByIdAndDelete(req.params.id);

        await AuditLog.create({
            action: 'MEMBER_DELETED',
            entity: 'Member',
            entityId: req.params.id,
            performedBy: req.user.churchId,
            role: req.user.role,
            details: { churchId: member.churchId, fullName: member.fullName }
        }).catch(err => console.error(err.message));

        res.json({
            success: true,
            message: `Member ${member.churchId} deleted successfully.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

