require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/authRoutes");
const dns=require("dns");
const userRoutes = require("./routes/userRoutes");
const adminRoutes= require("./routes/adminRoutes");

const menuRoutes = require("./routes/menuRoutes");

require("./config/dns")

const connectDB = require("./config/db");
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
connectDB();  


app.get("/", (req, res) => {
  res.send("Restaurant Backend Running");
});

app.use("/menu", menuRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/admin",adminRoutes);
app.use("/admin",menuRoutes)


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});