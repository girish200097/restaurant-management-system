const jwt = require("jsonwebtoken");
const waiterMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization header is missing",
            });
        }

        if(!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Invalid authorization format",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "waiter") {
            return res.status(403).json({
                message: "Access denied. Waiter role required.",
            });
        }

        req.user = decoded;
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}

module.exports = waiterMiddleware;