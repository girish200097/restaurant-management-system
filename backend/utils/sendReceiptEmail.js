const sendEmail = require("./sendEmail");

const sendReceiptEmail = async (customer, order, payment) => {
    const items = order.items
        .map((item) => {
            return `${item.menuItem.name} x ${item.quantity} = ₹${
                item.price * item.quantity
            }`;
        })
        .join("\n");

    const message = `
Restaurant Receipt
==============================

Customer: ${customer.name || "Customer"}
Email: ${customer.email}

Order ID: ${order._id}
Table: ${order.table.tableNumber}
Date: ${order.createdAt}

------------------------------
Items
------------------------------
${items}

------------------------------
Total: ₹${order.totalAmount}
Payment Status: ${payment.paymentStatus}
Payment ID: ${payment.razorpayPaymentId}

==============================
Thank you for ordering!
`;

console.log("Receipt will be sent to:", customer.email);
    await sendEmail(
        customer.email,
        "Restaurant Order Receipt",
        message
    );
};

module.exports = sendReceiptEmail;