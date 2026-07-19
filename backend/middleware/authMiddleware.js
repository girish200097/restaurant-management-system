const jwt = require("jsonwebtoken");

const authMiddleware = (req,res,next)=> {
try {
const authHeader = req.headers.authorization;

if (!authHeader) {
    return res.status(401).json({
        message: "Authorization header is missing",
    });
}

if (!authHeader.startsWith("Bearer ")){
    return res.status(401).json({
        message:"Invalid authorization format"
    });
}
const token = authHeader.split(" ")[1]; 

console.log("Token:", token);
const decode = jwt.verify(
    token,process.env.JWT_SECRET
);

req.user = decode;
next();
}
catch (error) {
    console.log(error)
    return res.status(401).json ({
        message: "Invalid or expired tooken",
    });
    
}
};
module.exports = authMiddleware;