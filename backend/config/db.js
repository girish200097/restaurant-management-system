const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("db connected successfully")
    }
    catch(error){
        console.log("mongodb connection failed")
        console.log(error)
        process.exit(1);
    }
};
module.exports =connectDB;