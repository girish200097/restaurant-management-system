require("dotenv").config();

const nodemailer = require("nodemailer");

async function test() {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "Test Email",
            text: "This is a test email.",
        });

        console.log("Success!");
        console.log(info);
    } catch (error) {
        console.log(error);
    }
}

test();