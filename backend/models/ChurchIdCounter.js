const mongoose = require('mongoose');

const churchIdCounterSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
        unique: true
    },
    lastSequence: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

churchIdCounterSchema.statics.getNextChurchId = async function(prefix = 'BSC', year = new Date().getFullYear()) {
    const counter = await this.findOneAndUpdate(
        { year },
        { $inc: { lastSequence: 1 } },
        { new: true, upsert: true }
    );
    const padded = String(counter.lastSequence).padStart(4, '0');
    return `${prefix}-${year}-${padded}`;
};

module.exports = mongoose.model('ChurchIdCounter', churchIdCounterSchema);

