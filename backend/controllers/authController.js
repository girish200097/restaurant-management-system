const User = require("../models/User");
const crypto = require("crypto");
const validator = require("validator");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

const login=async (req,res)=>{
    let {email}=req.body;
     
    if(!email){
       return res.status(400).json({
            message:"Email required"
        })
    }
        email=email.toLowerCase().trim()
     if (!validator.isEmail(email)) {
        return res.status(400).json({
            message: "Type a valid email",
        });
    }

    const loginToken = crypto.randomBytes(32).toString("hex");
console.log(loginToken)
const loginTokenExpires = new Date(
    Date.now() + 15 * 60 * 1000);   

   const magicLink = `${process.env.BASE_URL}/auth/verify?token=${loginToken}`;
try {
const existingUser =await User.findOne({
    email,
})

if(existingUser){
existingUser.loginToken = loginToken;
existingUser.loginTokenExpires = loginTokenExpires;

await existingUser.save();

await sendEmail(
    email,
    "Login to Restaurant App",
    `Click the magic link...
        ${magicLink}`
);

    return res.json({
    message: "Congratulations! Your backend can send emails successfully.",
});
}


const newUser = await User.create({
    email,
    loginToken,
    loginTokenExpires,
})


await sendEmail(
    email,
    "Login to Restaurant App",
    `Click the magic link...
    ${magicLink}`
);

return res.status(201).json({
    message: "New User Created",
    user: newUser
        
    })
}

catch (error){
    console.log(error)
    return res.status(500).json({
        message: "Something went wrong"
    })
}
}


const verifyLogin = async(req,res) => {
    const {token} = req.query;
    console.log(token);
  const user = await User.findOne({
    loginToken:token,
  })
  if(!user){
    return res.status(400).json({
        message: "Invalid Token"
    });
}


if(user.loginTokenExpires<new Date()){
    return res.status(400).json({
        message:"Token has expired"
    });
}
 
user.loginToken=undefined;
user.loginTokenExpires=undefined;
await user.save();


const jwtToken = jwt.sign(
    {
        userId: user._id,
        role: user.role,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "367d",
    }
);

return res.json({
    message: "Login Successful",
    token: jwtToken,
});
}

module.exports={
    login,
    verifyLogin,
};