const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        index: true
    },
    entity: {
        type: String,
        required: true
    },
    entityId: {
        type: String,
        default: ''
    },
    performedBy: {
        type: String,
        default: 'System'
    },
    role: {
        type: String,
        default: 'System'
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);

