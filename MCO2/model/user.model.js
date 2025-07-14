const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    aboutMe: {
        type: String,
        default: 'No bio yet.'
    },
    type: {
        type: String,
        enum: ['student', 'technician'],
        default: 'technician'
    },
    profilePicture: {
        type: String,
        default: 'https://res.cloudinary.com/davgly7hd/image/upload/v1752317177/default_profile_exl9yv.jpg'
    },
    phoneNumber: {
        type: String,
        default: 'No phone number yet.'
    },
    specialty: {
        type: String,
    },
    tasks: {
        type: [{
            title: {
                type: String,
                required: true
            },
            labRoom: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Room',
                required: true
            },
            due: {
                type: Date,
                default: Date.now
            }
        }],
        default: []
    }
}, {
    timestamps: true,
    collection: 'users'
});

userSchema.methods.hashPassword = async function(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('User', userSchema);