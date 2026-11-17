const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    churchId: {
        type: String,
        required: [true, 'Church ID is required'],
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['Super Admin', 'Church Admin', 'Pastor', 'Department Head', 'Church Member'],
        default: 'Church Member'
    },
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
