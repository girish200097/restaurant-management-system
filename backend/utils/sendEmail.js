 const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (email, subject, message) => {
   await transporter.sendMail({
    from: `"Personal Project" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: subject,
    text: message,
});
};

module.exports = sendEmail;