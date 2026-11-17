const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// Format today's date YYYY-MM-DD
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

// @route   POST /api/attendance/checkin
// @desc    Record attendance by QR scan, Church ID, or Member ID
// @access  Private (Staff/Admins/Pastors/Dept Heads)
router.post('/checkin', protect, authorize('Super Admin', 'Church Admin', 'Pastor', 'Department Head'), async (req, res) => {
    try {
        let { churchId, memberId, serviceType, date, status, checkInMethod, notes } = req.body;

        const recordDate = date || getTodayDateString();
        const selectedService = serviceType || 'Sunday Worship';

        let member;
        if (churchId) {
            // Can be full verification URL or raw Church ID from QR scan
            let cleanId = churchId.trim();
            if (cleanId.includes('/verify/')) {
                cleanId = cleanId.split('/verify/')[1].split(/[?#&/]/)[0];
            }
            member = await Member.findOne({ churchId: cleanId.toUpperCase() }).populate('department');
        } else if (memberId) {
            member = await Member.findById(memberId).populate('department');
        }

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found with the provided Church ID or QR code.'
            });
        }

        if (member.membershipStatus !== 'Active') {
            return res.status(400).json({
                success: false,
                message: `Member ${member.fullName} is currently marked as ${member.membershipStatus}.`
            });
        }

        // Check for duplicate attendance record
        const existing = await Attendance.findOne({
            churchId: member.churchId,
            serviceType: selectedService,
            date: recordDate
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                alreadyCheckedIn: true,
                message: `${member.fullName} (${member.churchId}) was already checked in for ${selectedService} on ${recordDate} at ${new Date(existing.checkInTime).toLocaleTimeString()}.`,
                attendance: existing
            });
        }

        const newAttendance = new Attendance({
            member: member._id,
            churchId: member.churchId,
            memberName: member.fullName,
            department: member.department ? member.department._id : undefined,
            serviceType: selectedService,
            date: recordDate,
            checkInTime: new Date(),
            status: status || 'Present',
            checkInMethod: checkInMethod || 'Church ID Search',
            recordedBy: req.user._id,
            notes: notes || ''
        });

        const saved = await newAttendance.save();

        await AuditLog.create({
            action: 'ATTENDANCE_RECORDED',
            entity: 'Attendance',
            entityId: saved._id.toString(),
            performedBy: req.user.churchId,
            role: req.user.role,
            details: { churchId: member.churchId, serviceType: selectedService, date: recordDate }
        }).catch(err => console.error(err.message));

        res.status(201).json({
            success: true,
            message: `Check-in successful for ${member.fullName} (${member.churchId})`,
            attendance: saved,
            member: {
                fullName: member.fullName,
                churchId: member.churchId,
                photo: member.photo,
                department: member.department ? member.department.name : 'None'
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Duplicate record detected: Member already checked in for this service today.'
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/attendance
// @desc    List attendance records with filters & search
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { date, startDate, endDate, serviceType, department, search, limit = 100, page = 1 } = req.query;
        const query = {};

        // If member role, only show their own attendance
        if (req.user.role === 'Church Member') {
            query.churchId = req.user.churchId;
        } else if (search) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ memberName: regex }, { churchId: regex }];
        }

        if (date) {
            query.date = date;
        } else if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }

        if (serviceType) query.serviceType = serviceType;
        if (department) query.department = department;

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Attendance.countDocuments(query);
        const records = await Attendance.find(query)
            .populate('department', 'name code')
            .populate('member', 'fullName photo phone churchId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            records
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/attendance/summary
// @desc    Get attendance reports & statistics (daily, weekly, monthly, yearly, service & department wise)
// @access  Private (Staff/Admins/Pastors)
router.get('/summary', protect, authorize('Super Admin', 'Church Admin', 'Pastor', 'Department Head'), async (req, res) => {
    try {
        const today = getTodayDateString();
        const totalActiveMembers = await Member.countDocuments({ membershipStatus: 'Active' });

        // Today's attendance count
        const todayCount = await Attendance.countDocuments({ date: today });
        const todayPercentage = totalActiveMembers > 0 ? Math.round((todayCount / totalActiveMembers) * 100) : 0;

        // Today's breakdown by service
        const todayServices = await Attendance.aggregate([
            { $match: { date: today } },
            { $group: { _id: '$serviceType', count: { $sum: 1 } } }
        ]);

        // Last 7 days attendance trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

        const recentDays = await Attendance.aggregate([
            { $match: { date: { $gte: sevenDaysStr } } },
            { $group: { _id: '$date', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // Monthly trend for current year
        const currentYear = new Date().getFullYear();
        const monthlyStats = await Attendance.aggregate([
            { $match: { date: { $gte: `${currentYear}-01-01`, $lte: `${currentYear}-12-31` } } },
            {
                $group: {
                    _id: { $substr: ['$date', 0, 7] }, // YYYY-MM
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Service Type overall breakdown
        const serviceBreakdown = await Attendance.aggregate([
            { $group: { _id: '$serviceType', count: { $sum: 1 } } }
        ]);

        // Department breakdown
        const departmentBreakdown = await Attendance.aggregate([
            { $match: { department: { $ne: null } } },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'dept'
                }
            },
            { $unwind: '$dept' },
            { $project: { name: '$dept.name', count: 1 } }
        ]);

        res.json({
            success: true,
            summary: {
                todayDate: today,
                todayCount,
                totalActiveMembers,
                todayPercentage,
                todayServices,
                recentDays,
                monthlyStats,
                serviceBreakdown,
                departmentBreakdown
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/attendance/export-csv
// @desc    Export attendance records as CSV format
// @access  Private (Staff/Admins/Pastors)
router.get('/export-csv', protect, authorize('Super Admin', 'Church Admin', 'Pastor'), async (req, res) => {
    try {
        const { date, serviceType, department } = req.query;
        const query = {};
        if (date) query.date = date;
        if (serviceType) query.serviceType = serviceType;
        if (department) query.department = department;

        const records = await Attendance.find(query)
            .populate('department', 'name')
            .sort({ date: -1, checkInTime: -1 });

        // Generate CSV string
        const headers = ['Church ID', 'Member Name', 'Department', 'Service Type', 'Date', 'Check-in Time', 'Status', 'Method'];
        const rows = records.map(r => [
            `"${r.churchId}"`,
            `"${r.memberName.replace(/"/g, '""')}"`,
            `"${r.department ? r.department.name : 'N/A'}"`,
            `"${r.serviceType}"`,
            `"${r.date}"`,
            `"${new Date(r.checkInTime).toLocaleTimeString()}"`,
            `"${r.status}"`,
            `"${r.checkInMethod}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=Church_Attendance_${date || 'all'}.csv`);
        res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete an attendance record
// @access  Private (Super Admin, Church Admin)
router.delete('/:id', protect, authorize('Super Admin', 'Church Admin'), async (req, res) => {
    try {
        const record = await Attendance.findByIdAndDelete(req.params.id);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found.' });
        }
        res.json({ success: true, message: 'Attendance record removed.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
