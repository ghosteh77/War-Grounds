const mongoose = require('mongoose');

const applicationSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        default: 'staff_applications'
    },

    open: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model(
    'ApplicationSettings',
    applicationSettingsSchema
);