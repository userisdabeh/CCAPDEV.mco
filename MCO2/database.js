const mongoose = require('mongoose');
const db = 'mongodb://localhost:27017/gokolab';

module.exports = () => { return mongoose.connect(db) }