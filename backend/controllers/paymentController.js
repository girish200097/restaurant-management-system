const mongoose = require("mongoose");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

//createPayment
const createPayment = async (req, res) => {
    try {
        //  const {paymentMethod} = req.body;
        const {orderId} = req.params;

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required",
            });
        }

        // if (!paymentMethod) {
        //     return res.status(400).json({
        //         message: "Payment method is required",
        //     });
        // }

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
            paymentStatus: "pending",
        });

        if (existingPayment) {

                const razorpayOrder = await razorpay.orders.create({
                    amount: Math.round(order.totalAmount * 100),
                    currency: "INR",
                    receipt: `order_${order._id}_${Date.now()}`,
                });

                existingPayment.razorpayOrderId = razorpayOrder.id;

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
            razorpayOrder:{
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
            return res.status(400).json({
                message: "Payment is already completed",
            });
        }

        // Make sure this payment belongs to the logged-in customer
        if (payment.customer.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only verify your own payment",
            });
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.paymentStatus = "paid";

        await payment.save();

        const order = await Order.findById(payment.order);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        order.paymentStatus = "paid";
        order.orderStatus = "completed";
        order.isActive = false;

        await order.save();

        const table = await Table.findById(order.table);

        if (table) {
            table.status = "available";
            await table.save();
        }

        return res.status(200).json({
            message: "Payment verified successfully",
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
//confirmPayment
// const confirmPayment = async (req, res) => {
//     try {
//         const {Id} = req.params;
//         if(!mongoose.Types.ObjectId.isValid(Id)) {
//             return res.status(400).json({
//                 message: "Invalid payment Id",
//             });
//         }
//         const payment = await Payment.findById(Id);
//         if(!payment) {
//             return res.status(404).json({
//                 message: "Payment not found",
//             });
//         }
//         if (payment.customer.toString() !== req.user.userId) {
//             return res.status(403).json({
//                 message: "You can only confirm your own payment",
//             });
//         }        
        
//         if(payment.paymentStatus === "paid") {
//             return res.status(400).json({
//                 message: "payment is already completed",
//             });
//         }

//         payment.paymentStatus = "paid";
//         payment.transactionId = `TXN-${Date.now()}`;
//         await payment.save();

//         const order = await Order.findById(payment.order);

//         if(!order) {
//             return res.status(404).json({
//                 message: "Order not found",
//             });
//         }
//         order.paymentStatus = "paid";
//         order.isActive = false;
//         order.orderStatus = "completed";

//         await order.save();

//         const table = await Table.findById(order.table);
//         if((table)) {
//             table.status = "available";
//             await table.save();
//         }

//         return res.status(200).json({
//             message: "Payment confirmed successfully",
//             payment,
//             order,
//         });
//     }
//     catch(error) {
//         console.log(error);

//         return res.status(500).json({
//             message: "Internal Server Error",
//         });
//     }
// };

module.exports = {
    createPayment,
    // confirmPayment,
    verifyPayment,
};