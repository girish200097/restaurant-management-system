const express = require("express");

const {
    createPayment,
    verifyPayment,
    paymentWebhook,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.post(
    "/verify",
    authMiddleware,
    verifyPayment
);

router.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    paymentWebhook
);

router.post(
    "/:orderId",
    authMiddleware,
    createPayment
);





module.exports = router;