const sendEmail = require("./sendEmail");
const generateReceiptPDF = require("./generateReceiptPDF");

const sendReceiptEmail = async (customer, order, payment) => {
    const pdfBuffer = await generateReceiptPDF(
        customer,
        order,
        payment
    );

    await sendEmail(
        customer.email,
        "Restaurant Order Receipt",
        "Thank you for your order. Your receipt is attached as a PDF.",
        [
            {
                filename: `receipt-${order._id}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ]
    );
};

module.exports = sendReceiptEmail;