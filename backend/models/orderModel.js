const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    waiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
},
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table"
    },
    items: [
        {
            menuItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Menu"
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    orderStatus: {
         type: String,
         enum: ["pending","preparing","served","completed","cancelled"],
         default: "pending",
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    
},
    {
        timestamps: true
    }    
)

const Order = mongoose.model("Order",orderSchema);
module.exports = Order;