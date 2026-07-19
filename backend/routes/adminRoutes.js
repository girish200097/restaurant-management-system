const express = require("express");
const router = express.Router();
const {adminLogin} = require("../controllers/adminController");

router.post("/login",adminLogin);

const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/dashboard", adminMiddleware, (req, res) => {
    res.json({
        message: "Welcome Admin",
        admin: req.admin,
    });
});
module.exports = router;