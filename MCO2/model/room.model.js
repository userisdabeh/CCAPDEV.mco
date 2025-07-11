const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomName: String,
    roomSlots: Number,
    roomBuilding: String,
    roomStatus: {
        enum: ['available', 'unavailable', 'maintenance'],
        type: String,
        default: 'available',
        required: true
    }
}, {
    timestamps: true,
    collection: 'rooms'
});

module.exports = mongoose.model('Room', roomSchema);