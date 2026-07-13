const express = require("express");

const router = express.Router();

const {login,verifyLogin} = require("../controllers/authController");


router.post("/login",login);
router.get("/verify",verifyLogin);

module.exports = router;

