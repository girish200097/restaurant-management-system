require("dotenv").config();
const express = require("express");
const menuRoutes = require("./routes/menuRoutes");
const authRoutes = require("./routes/authRoutes");
const dns=require("dns");
const userRoutes = require("./routes/userRoutes");

dns.setServers([
  '1.1.1.1',
  '8.8.8.8'
])


console.log(process.env.MONGODB_URI);

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



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});