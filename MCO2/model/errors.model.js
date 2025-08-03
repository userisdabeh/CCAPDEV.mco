const mongoose = require('mongoose');

const errorSchema = new mongoose.Schema({
    errorMessage: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Error', errorSchema);