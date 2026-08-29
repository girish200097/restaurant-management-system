const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },

    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    amount: {
        type: Number,
        required: true,
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
    },

    paymentMethod: {
        type: String,
        enum: ['card', 'upi'],
    },

    transaction: {
        type: String,
        default: null,
    },
    razorpayOrderId: {
    type: String,
    required: true,
    },
    razorpayPaymentId: {
        type: String,
        default: null,
    },
    razorpaySignature: {
        type: String,
        default: null,
    },
},
 {
        timestamps: true
    });
const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;