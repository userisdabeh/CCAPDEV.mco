/*const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Just define schemas and models (NO connect here)

// Login Schema
const loginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});

// Signup Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const Login = mongoose.model("Login", loginSchema);
const User = mongoose.model("User", userSchema);

module.exports = { Login, User };*/
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/GKLabDB")
.then(()=>{
    console.log("MongoDB conected");
})

.catch(()=>{
    console.log("failed to connect MongoDB");
})

// Login Schema
const loginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
});

const Login = mongoose.model("Login", loginSchema);
module.exports = Login;