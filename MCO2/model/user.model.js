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
        default: null
    },
    type: {
        enum: ['student', 'admin'],
        default: 'student',
        type: String
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