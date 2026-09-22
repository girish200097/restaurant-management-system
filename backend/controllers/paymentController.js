const mongoose = require("mongoose");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const sendReceiptEmail = require("../utils/sendReceiptEmail");

//createPayment
const createPayment = async (req, res) => {
    try {
        const {orderId} = req.params;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                message: "Invalid order Id",
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        if (order.customer.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only pay for your own order",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                message: "Order is already paid",
            });
        }

        const existingPayment = await Payment.findOne({
            order: orderId,
        });

        if (existingPayment) {

            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(order.totalAmount * 100),
                currency: "INR",
                receipt: `order_${order._id}_${Date.now()}`,
            });

            existingPayment.razorpayOrderId = razorpayOrder.id;
            existingPayment.paymentStatus = "pending";
            existingPayment.razorpayPaymentId = null;
            existingPayment.razorpaySignature = null;

            await existingPayment.save();

            return res.status(200).json({
                message: "Existing payment reused",
                payment: existingPayment,
                razorpayOrder: {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                },
                key_id: process.env.RAZORPAY_KEY_ID,
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100),
            currency: "INR",
            receipt: `order_${order._id}`,
        });

        const payment = await Payment.create({
            order: orderId,
            customer: order.customer,
            amount: order.totalAmount,
            razorpayOrderId: razorpayOrder.id,
        });

        return res.status(201).json({
            message: "Payment created successfully",
            payment,
            razorpayOrder: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
            },
            key_id: process.env.RAZORPAY_KEY_ID,
        });

    }
    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


//verifyPayment
const verifyPayment = async (req, res) => {
    try {
        console.log("VERIFY PAYMENT CALLED");

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message: "Payment verification details are required",
            });
        }

        const body =
            razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid payment signature",
            });
        }

        const payment = await Payment.findOne({
            razorpayOrderId: razorpay_order_id,
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment record not found",
            });
        }

        if (payment.paymentStatus === "paid") {
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;

            await payment.save();

            return res.status(200).json({
                message: "Payment completed successfully",
                payment,
            });
        }

        if (payment.customer.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only verify your own payment",
            });
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.paymentStatus = "paid";

        await payment.save();

        const order = await Order.findById(orderId)
            .populate("customer")
            .populate("table")
            .populate("items.menuItem");

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        order.paymentStatus = "paid";

        await order.save();

        return res.status(200).json({
            message: "Payment completed successfully",
            payment,
            order,
        });

    }
    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


// paymentWebhook
const paymentWebhook = async (req, res) => {
    try {
        const webhookSignature = req.headers["x-razorpay-signature"];
        const webhookEventId = req.headers["x-razorpay-event-id"];

        if (!webhookSignature) {
            return res.status(400).json({
                message: "Webhook signature is missing",
            });
        }

        if (!webhookEventId) {
            return res.status(400).json({
                message: "Webhook event ID is missing",
            });
        }

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_WEBHOOK_SECRET
            )
            .update(req.body)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature, "utf8");
        const receivedBuffer = Buffer.from(webhookSignature, "utf8");

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.status(400).json({
                message: "Invalid webhook signature",
            });
        }

        const event = JSON.parse(req.body.toString());

        console.log("Razorpay webhook event:", event.event);

        const existingPayment = await Payment.findOne({
            webhookEventIds: webhookEventId,
        });

        if (existingPayment) {
            return res.status(200).json({
                message: "Webhook event already processed",
            });
        }

        if (event.event === "payment.captured") {
            console.log("PAYMENT CAPTURED WEBHOOK REACHED");

            const razorpayPayment = event.payload.payment.entity;

            const payment = await Payment.findOne({
                razorpayOrderId: razorpayPayment.order_id,
            });

            if (!payment) {
                return res.status(404).json({
                    message: "Payment record not found",
                });
            }

            if (razorpayPayment.amount !== payment.amount * 100) {
                return res.status(400).json({
                    message: "Payment amount mismatch",
                });
            }

            if (payment.paymentStatus === "paid") {
                payment.webhookEventIds.push(webhookEventId);
                await payment.save();

                return res.status(200).json({
                    message: "Payment already processed",
                });
            }

            payment.razorpayPaymentId = razorpayPayment.id;
            payment.paymentStatus = "paid";
            payment.webhookEventIds.push(webhookEventId);

            await payment.save();

            const order = await Order.findById(payment.order)
                .populate("customer")
                .populate("table")
                .populate("items.menuItem");

            if (order) {
                order.paymentStatus = "paid";

                await order.save();

                if (order.table) {
                    order.table.status = "available";
                    await order.table.save();
                }
            }
        }

        if (event.event === "payment.failed") {
            const razorpayPayment = event.payload.payment.entity;

            const payment = await Payment.findOne({
                razorpayOrderId: razorpayPayment.order_id,
            });

            if (!payment) {
                return res.status(404).json({
                    message: "Payment record not found",
                });
            }

            payment.paymentStatus = "failed";
            payment.webhookEventIds.push(webhookEventId);

            await payment.save();
        }

        return res.status(200).json({
            message: "Webhook processed successfully",
        });

    }
    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


//generateReceipt

const generateReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                message: "Invalid Order ID",
            });
        }

        const payment = await Payment.findOne({
            order: orderId,
        });

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found",
            });
        }

        if (payment.paymentStatus !== "paid") {
            return res.status(400).json({
                message: "Payment is not completed",
            });
        }

        if (payment.receiptSent) {
            return res.status(400).json({
                message: "Receipt has already been sent",
            });
        }

        const order = await Order.findById(orderId)
            .populate("customer")
            .populate("table")
            .populate("items.menuItem");

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        if (order.customer._id.toString() !== req.user.userId.toString()) {
            return res.status(403).json({
                message: "You are not allowed to generate this receipt",
            });
        }

        await sendReceiptEmail(
            order.customer,
            order,
            payment
        );

        payment.receiptSent = true;
        await payment.save();

        return res.status(200).json({
            message: "Receipt generated and sent successfully",
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


module.exports = {
    createPayment,
    verifyPayment,
    paymentWebhook,
    generateReceipt,
};v