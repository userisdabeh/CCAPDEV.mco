const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reservationDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    roomID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    status: ['pending', 'confirmed', 'cancelled']
}, {
    timestamps: true,
    collection: 'reservations'
});

module.exports = mongoose.model('Reservation', reservationSchema);