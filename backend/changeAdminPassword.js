const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

require("dotenv").config();

const changePassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const email = "girishkundagolg@gmail.com";
        const newPassword = "Girish@1234";

        const admin = await User.findOne({
            email,
            role: "admin",
        });

        if (!admin) {
            console.log("Admin not found");
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;

        await admin.save();

        console.log("Admin password changed successfully");
    } catch (error) {
        console.log(error);
    } finally {
        await mongoose.disconnect();
    }
};

changePassword();