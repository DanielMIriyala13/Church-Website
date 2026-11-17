const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    churchId: {
        type: String,
        required: [true, 'Church ID is required'],
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    photo: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: 'Kadapa' },
        state: { type: String, default: 'Andhra Pradesh' },
        postalCode: { type: String, default: '' }
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Male'
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
        default: 'Unknown'
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    membershipStatus: {
        type: String,
        enum: ['Active', 'Inactive', 'Probation', 'Transferred', 'Alumni'],
        default: 'Active'
    },
    emergencyContact: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        relation: { type: String, default: '' }
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);

