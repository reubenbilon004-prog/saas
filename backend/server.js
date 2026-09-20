require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const googleAuth = require("./routes/googleAuth");
const cookieParser = require("cookie-parser");
const subscriptionRoutes = require("./routes/subscription");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true
}));
const authLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message:{
        message: "Too many requests, please try again later"
    }
}) ;

app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to MongoDB");
    })
    .catch((error)=>{
        console.log(`MongoDB connection failed:${error.message}`);
    });

app.get("/",(req,res)=>{
    res.status(200).json({
        message: "Saas Backend Api is running"
    });
});
app.use("/api/auth",authLimit,authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/subscription",subscriptionRoutes);
app.use("/api/auth",googleAuth);
const PORT = process.env.PORT || 3000;

app.listen(PORT,"0.0.0.0",() =>{
    console.log(`Server running on port ${PORT}`)
});