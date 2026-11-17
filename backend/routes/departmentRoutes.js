const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/departments
// @desc    Get all departments with member count
// @access  Public / Private
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true })
            .populate('head', 'fullName churchId photo phone email')
            .sort({ name: 1 });

        // Calculate member counts per department
        const counts = await Member.aggregate([
            { $match: { department: { $ne: null }, membershipStatus: 'Active' } },
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        counts.forEach(c => {
            countMap[c._id.toString()] = c.count;
        });

        const result = departments.map(d => {
            const doc = d.toObject();
            doc.memberCount = countMap[d._id.toString()] || 0;
            return doc;
        });

        res.json({ success: true, count: result.length, departments: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/departments/:id
// @desc    Get single department with details, head, member list, and announcements
// @access  Public / Private
router.get('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id).populate('head', 'fullName churchId photo phone email');
        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found.' });
        }

        const members = await Member.find({ department: department._id, membershipStatus: 'Active' })
            .select('fullName churchId photo phone email bloodGroup joiningDate');

        const announcements = await Announcement.find({
            category: { $in: [department.name, 'General'] },
            status: 'published',
            isActive: true
        }).sort({ createdAt: -1 }).limit(5);

        // Attendance stats for this department
        const attendanceStats = await Attendance.aggregate([
            { $match: { department: department._id } },
            { $group: { _id: '$serviceType', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            department: {
                ...department.toObject(),
                memberCount: members.length,
                members,
                announcements,
                attendanceStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/departments
// @desc    Create department
// @access  Private (Super Admin, Church Admin)
router.post('/', protect, authorize('Super Admin', 'Church Admin'), async (req, res) => {
    try {
        const { name, code, description, head, meetingSchedule, color, icon } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Department name is required.' });
        }

        const deptCode = (code || name.replace(/[^A-Za-z0-9]/g, '_')).toUpperCase();

        const existing = await Department.findOne({
            $or: [{ name: new RegExp(`^${name}$`, 'i') }, { code: deptCode }]
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Department with this name or code already exists.' });
        }

        const newDept = new Department({
            name,
            code: deptCode,
            description: description || '',
            head: head || undefined,
            meetingSchedule: meetingSchedule || 'Every Sunday after main service',
            color: color || '#D4AF37',
            icon: icon || 'users'
        });

        const saved = await newDept.save();

        await AuditLog.create({
            action: 'DEPARTMENT_CREATED',
            entity: 'Department',
            entityId: saved._id.toString(),
            performedBy: req.user.churchId,
            role: req.user.role,
            details: { name: saved.name }
        }).catch(err => console.error(err.message));

        res.status(201).json({ success: true, department: saved });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Super Admin, Church Admin, Pastor, Dept Head)
router.put('/:id', protect, authorize('Super Admin', 'Church Admin', 'Pastor', 'Department Head'), async (req, res) => {
    try {
        const dept = await Department.findById(req.params.id);
        if (!dept) {
            return res.status(404).json({ success: false, message: 'Department not found.' });
        }

        const { name, code, description, head, meetingSchedule, color, icon, isActive } = req.body;

        if (name) dept.name = name;
        if (code) dept.code = code.toUpperCase();
        if (description !== undefined) dept.description = description;
        if (head !== undefined) dept.head = head || null;
        if (meetingSchedule !== undefined) dept.meetingSchedule = meetingSchedule;
        if (color) dept.color = color;
        if (icon) dept.icon = icon;
        if (typeof isActive === 'boolean') dept.isActive = isActive;

        const updated = await dept.save();

        res.json({ success: true, message: 'Department updated.', department: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department (or set inactive)
// @access  Private (Super Admin, Church Admin)
router.delete('/:id', protect, authorize('Super Admin', 'Church Admin'), async (req, res) => {
    try {
        const dept = await Department.findById(req.params.id);
        if (!dept) {
            return res.status(404).json({ success: false, message: 'Department not found.' });
        }

        // Unlink members from this department
        await Member.updateMany({ department: dept._id }, { $unset: { department: '' } });
        await Department.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: `Department ${dept.name} deleted successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/departments/:id/assign-member
// @desc    Assign member to department
// @access  Private (Super Admin, Church Admin, Pastor, Dept Head)
router.post('/:id/assign-member', protect, authorize('Super Admin', 'Church Admin', 'Pastor', 'Department Head'), async (req, res) => {
    try {
        const { memberId, churchId } = req.body;
        let member;
        if (memberId) {
            member = await Member.findById(memberId);
        } else if (churchId) {
            member = await Member.findOne({ churchId: churchId.toUpperCase() });
        }

        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found.' });
        }

        member.department = req.params.id;
        await member.save();

        res.json({ success: true, message: `Member ${member.fullName} assigned to department.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

