const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    reservationDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String, // e.g., "08:00-10:00"
        required: true
    },
    name: {
        type: String,
        required: true
    },
    anonymous: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Expired'],
        default: 'Pending'
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    }
}, {
    timestamps: true,
    collection: 'reservations'
});

module.exports = mongoose.model('Reservation', reservationSchema);
