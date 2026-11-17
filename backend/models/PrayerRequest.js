const mongoose = require('mongoose');

const prayerRequestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Prayer request title is required'],
        trim: true
    },
    request: {
        type: String,
        required: [true, 'Prayer description is required'],
        trim: true
    },
    requesterName: {
        type: String,
        default: 'Anonymous',
        trim: true
    },
    requesterPhone: {
        type: String,
        trim: true,
        default: ''
    },
    requesterEmail: {
        type: String,
        trim: true,
        default: ''
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    privacyLevel: {
        type: String,
        enum: ['Public', 'Prayer Team', 'Pastor Only', 'Private'],
        default: 'Public',
        index: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Under Prayer', 'Answered'],
        default: 'Pending',
        index: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    answeredTestimony: {
        type: String,
        default: ''
    },
    pastorNotes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);
