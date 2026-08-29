const express = require("express");

const {
    createPayment,
    verifyPayment,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.post(
    "/verify",
    authMiddleware,
    verifyPayment
);

router.post(
    "/:orderId",
    authMiddleware,
    createPayment
);



module.exports = router;