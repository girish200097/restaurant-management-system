const PDFDocument = require("pdfkit");

const generateReceiptPDF = (customer, order, payment) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const buffers = [];

            doc.on("data", (chunk) => {
                buffers.push(chunk);
            });

            doc.on("end", () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });

            doc.on("error", reject);

            // Receipt title
            doc
                .fontSize(20)
                .text("Restaurant Receipt", { align: "center" });

            doc.moveDown();

            // Customer details
            doc.fontSize(12);
            doc.text(`Customer: ${customer.name || "Customer"}`);
            doc.text(`Email: ${customer.email}`);
            doc.text(`Order ID: ${order._id}`);
            doc.text(`Table: ${order.table.tableNumber}`);
            doc.text(`Date: ${order.createdAt}`);

            doc.moveDown();

            doc.text("----------------------------------------");

            doc.text("Items");

            doc.text("----------------------------------------");

            // Items
            order.items.forEach((item) => {
                const itemTotal = item.price * item.quantity;

                doc.text(
                    `${item.menuItem.name} x ${item.quantity} = ₹${itemTotal}`
                );
            });

            doc.moveDown();

            doc.text("----------------------------------------");

            doc.fontSize(14);
            doc.text(`Total: ₹${order.totalAmount}`);

            doc.fontSize(12);
            doc.text(`Payment Status: ${payment.paymentStatus}`);
            doc.text(`Payment ID: ${payment.razorpayPaymentId}`);

            doc.moveDown();

            doc.text("Thank you for ordering!", {
                align: "center",
            });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateReceiptPDF;