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
    default:"customer",
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
  }
});

const User =mongoose.model("User",userSchema);
module.exports = User;
