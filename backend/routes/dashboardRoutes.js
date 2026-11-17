const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const PrayerRequest = require('../models/PrayerRequest');
const Announcement = require('../models/Announcement');
const Event = require('../models/Event');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get central dashboard metrics, trends, and upcoming items
// @access  Private (Admins, Pastors, Dept Heads)
router.get('/stats', protect, authorize('Super Admin', 'Church Admin', 'Pastor', 'Department Head'), async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Total registered members & Active Church IDs
        const totalMembers = await Member.countDocuments();
        const activeMembers = await Member.countDocuments({ membershipStatus: 'Active' });
        const inactiveMembers = totalMembers - activeMembers;

        // 2. Department count
        const departmentCount = await Department.countDocuments({ isActive: true });

        // 3. Today's attendance & percentage
        const todayAttendance = await Attendance.countDocuments({ date: todayStr });
        const attendancePercentage = activeMembers > 0 ? Math.round((todayAttendance / activeMembers) * 100) : 0;

        // 4. Pending prayer requests
        const pendingPrayers = await PrayerRequest.countDocuments({ status: 'Pending' });
        const totalPrayers = await PrayerRequest.countDocuments();

        // 5. Upcoming programs/events
        const upcomingEvents = await Event.find({ date: { $gte: new Date() } })
            .sort({ date: 1 })
            .limit(5);

        // 6. Recent announcements
        const recentAnnouncements = await Announcement.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(5);

        // 7. Last 7 days attendance trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

        const attendanceTrend = await Attendance.aggregate([
            { $match: { date: { $gte: sevenDaysStr } } },
            { $group: { _id: '$date', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        // 8. Department distribution
        const departmentDistribution = await Member.aggregate([
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
            { $project: { name: '$dept.name', count: 1 } },
            { $sort: { count: -1 } }
        ]);

        // 9. Prayer status distribution
        const prayerStats = await PrayerRequest.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 10. Recent Audit Activities
        const recentActivities = await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(8);

        res.json({
            success: true,
            data: {
                metrics: {
                    totalMembers,
                    activeChurchIds: activeMembers,
                    inactiveMembers,
                    departmentCount,
                    todayAttendance,
                    attendancePercentage,
                    pendingPrayers,
                    totalPrayers,
                    upcomingEventsCount: upcomingEvents.length,
                    activeAnnouncementsCount: recentAnnouncements.length
                },
                charts: {
                    attendanceTrend,
                    departmentDistribution,
                    prayerStats
                },
                recent: {
                    events: upcomingEvents,
                    announcements: recentAnnouncements,
                    activities: recentActivities
                }
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
