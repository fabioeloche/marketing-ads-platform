const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoute = require("./route/authRoute");
const csvRoute = require("./route/csvRoute");
const adsRoute = require("./route/adsRoute");
const shareRoutes = require("./route/shareRoutes");
const emailRoute = require("./route/emailRoute");
const adminRoute = require("./route/adminRoute");


const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" })); // Allow JSON payloads
app.use(express.urlencoded({ extended: true, limit: "5mb" })); // Allow form-data

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/csv", csvRoute);
app.use("/api/ads", adsRoute);
app.use("/api/share", shareRoutes);
app.use("/api/email", emailRoute);
app.use("/api/admin", adminRoute);

//404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});