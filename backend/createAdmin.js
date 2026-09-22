require("dotenv").config();
require("./config/dns")

const bcrypt = require("bcrypt");

const User = require("./models/User");
const connectDB = require("./config/db");

const createAdmin = async ()=> {
    try {
        await connectDB();
        const existingAdmin = await User.findOne({
            role:"admin",
        });
        if (existingAdmin){
            console.log("admin already exists");
            process.exit();
        }
        const hashedPassword =await bcrypt.hash("Girish@20",10);
        password: hashedPassword;

        const admin = new User({
            name:"Restaurant Admin",
            email:"girishkundagolg@gmail.com",
            password: hashedPassword,
            role:"admin",
            isVerified: true,
            profileCompleted:true,
        })
        await admin.save();
        console.log("Admin created successfully");
        process.exit();

    }
    catch(error) {
        console.log(error); 
    }
}
createAdmin();