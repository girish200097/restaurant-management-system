require("dotenv").config();
const cors = require("cors");
const { Server } = require("socket.io");
const { setIO } = require("./socket");

const express = require("express");
const authRoutes = require("./routes/authRoutes");
const dns=require("dns");
const userRoutes = require("./routes/userRoutes");
const adminRoutes= require("./routes/adminRoutes");
const menuRoutes = require("./routes/menuRoutes");
const tableRoutes= require("./routes/tableRoutes");
const orderRoutes= require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const testEmailRoutes = require("./routes/testEmailRoutes");



require("./config/dns")

const connectDB = require("./config/db");
const PORT = process.env.PORT || 3000;

const app = express();

const http = require("http");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://restaurant-management-frontend-073k.onrender.com",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

setIO(io);


app.use(cors({
    origin: "https://restaurant-management-frontend-073k.onrender.com",
}));

app.use(
    "/payment/webhook",
    express.raw({ type: "application/json" })
);

app.use(express.json());



connectDB();  


app.get("/", (req, res) => {
  res.send("Restaurant Backend Running");
});

app.use("/test", testEmailRoutes);
app.use("/menu", menuRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/menu", menuRoutes);
app.use("/admin", tableRoutes);
app.use("/order", orderRoutes);
app.use("/payment", paymentRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinOrder", (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`Socket ${socket.id} joined order_${orderId}`);
  });

  socket.on("joinWaiter", (waiterId) => {
    socket.join(`waiter_${waiterId}`);
    console.log(`Socket ${socket.id} joined waiter_${waiterId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});