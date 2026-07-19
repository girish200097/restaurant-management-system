const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
   type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ["customer","waiter","admin"],
    default:"customer",
  },
  isAvailablle:{
    type:Boolean,
    default:false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  loginToken: {
    type: String,
  },
  loginTokenExpires: {
    type: Date,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  password:{
    type: String,
  },
});

const User =mongoose.model("User",userSchema);
module.exports = User;
