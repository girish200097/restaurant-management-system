const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {updateProfile, updateAvailability,getProfile,getAllUsers,updateUserRole,deleteUser,} = require("../controllers/userController");
const adminMiddleware = require("../middleware/adminMiddleware");

router.patch("/profile",authMiddleware,updateProfile);

router.patch(
    "/availability",
    authMiddleware,
    updateAvailability
);

router.get(
    "/users",
    adminMiddleware,
    getAllUsers
);

router.patch(
    "/:id/role",
    adminMiddleware,
    updateUserRole
);
router.delete(
    "/:id",
    adminMiddleware,
    deleteUser
);

router.get(
    "/profile",
    authMiddleware,
    getProfile
);
module.exports =router;