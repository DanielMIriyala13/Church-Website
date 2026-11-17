const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    meetingSchedule: {
        type: String,
        default: 'Every Sunday after main service'
    },
    color: {
        type: String,
        default: '#D4AF37'
    },
    icon: {
        type: String,
        default: 'users'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);

