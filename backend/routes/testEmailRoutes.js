const express = require("express");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

router.get("/test-email", async (req, res) => {
    try {
        const email = "kundagolsanjana85@gmail.com";

        await sendEmail(
            email,
            "Restaurant Email Test",
            "If you received this email, your email system is working."
        );

        console.log("Test email sent to:", email);

        res.status(200).json({
            message: "Test email sent successfully",
        });
    } catch (error) {
        console.log("EMAIL ERROR:", error);

        res.status(500).json({
            message: "Failed to send test email",
        });
    }
});

module.exports = router;