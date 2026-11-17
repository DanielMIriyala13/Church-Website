const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Announcement title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Announcement content is required']
    },
    category: {
        type: String,
        enum: [
            'General',
            'Sunday Service',
            'Youth',
            'Worship',
            'Special Event',
            'Urgent Notice',
            'Fasting & Prayer'
        ],
        default: 'General'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    posterUrl: {
        type: String,
        default: ''
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['published', 'scheduled', 'archived', 'draft'],
        default: 'published',
        index: true
    },
    targetAudience: {
        type: String,
        default: 'All'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
