const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {updateProfile,getAllUsers} = require("../controllers/userController");

router.patch("/profile",authMiddleware,updateProfile);
router.get("/users", getAllUsers);

module.exports =router;