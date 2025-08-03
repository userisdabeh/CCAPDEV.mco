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
    }
}, {
    timestamps: true,
    collection: 'reservations'
});

// Prevent double-booking same room/date/timeSlot
reservationSchema.index(
    { roomID: 1, reservationDate: 1, timeSlot: 1 },
    { unique: true, name: 'unique_room_date_time' }
);

reservationSchema.index(
    { userID: 1, reservationDate: 1, timeSlot: 1 },
    { unique: true, name: 'unique_user_date_time' }
);

module.exports = mongoose.model('Reservation', reservationSchema);
