const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    churchId: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        index: true
    },
    memberName: {
        type: String,
        required: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    serviceType: {
        type: String,
        enum: [
            'Sunday Worship',
            'Prayer Meeting',
            'Bible Study',
            'Youth Meeting',
            'Department Meeting',
            'Special Program'
        ],
        required: true
    },
    date: {
        type: String, // Format: 'YYYY-MM-DD'
        required: true,
        index: true
    },
    checkInTime: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Excused'],
        default: 'Present'
    },
    checkInMethod: {
        type: String,
        enum: ['QR Scan', 'Church ID Search', 'Manual Entry'],
        default: 'Manual Entry'
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate attendance for the same member, service type, and date
attendanceSchema.index({ churchId: 1, serviceType: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

