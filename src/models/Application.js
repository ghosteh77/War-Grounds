const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    robloxUsername: {
        type: String,
        required: true
    },

    experience: {
        type: String,
        required: true
    },

    whyStaff: {
        type: String,
        required: true
    },

    whyYou: {
        type: String,
        required: true
    },

    activity: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },

    submittedAt: {
        type: Date,
        default: Date.now
    },

    reviewedAt: {
        type: Date,
        default: null
    },

    reviewedBy: {
        type: String,
        default: null
    },

    cooldownUntil: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('Application', applicationSchema);