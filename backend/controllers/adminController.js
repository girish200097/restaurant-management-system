const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLogin = async(req,res)=>{
    try{
        const{email,password} = req.body;
        if(!email || !password) {
            return res.status(400).json({
                message:"Email and Password are required",
            })
        }
        const admin = await User.findOne({email})
        if(!admin) {
            return res.status(401).json({
                message:"Invalid credentials",
            });
        }
        if(admin.role !=="admin"){
            
            return res.status(403).json({
                message:"Access denied",
            })
        }

        const isMatch = await bcrypt.compare(
            password,
            admin.password
        )
        if(!isMatch){
            return res.status(401).json({
                message:"Invalid Credentials"
            });
        }
        const token =jwt.sign(
            {
            id:admin._id,
            role:admin.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"365d",
        }
    )
    return res.status(200).json({
        message:"Login Successful",
        token,
    })
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            message:"Internal Server Error"
        });
    }
};

module.exports = {adminLogin,

};