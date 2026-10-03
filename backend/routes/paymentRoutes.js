const express = require("express");


const {
    createPayment,
    verifyPayment,
    paymentWebhook,
    generateReceipt,
    getAllPayments,
    deletePayment,
    getPaymentStatus,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

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

router.post(
    "/receipt/:orderId",
    authMiddleware,
    generateReceipt
);

router.get(
    "/status/:orderId",
    authMiddleware,
    getPaymentStatus
);

router.get(
    "/",
    adminMiddleware,
    getAllPayments
);

router.delete(
    "/:id",
    adminMiddleware,
    deletePayment
);



module.exports = router;