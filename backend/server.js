const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoute = require("./routes/authRoute");
const csvRoute = require("./routes/csvRoute");
const adsRoute = require("./routes/adsRoute");
const shareRoutes = require("./routes/shareRoutes");
const emailRoute = require("./routes/emailRoute");
const adminRoute = require("./routes/adminRoute");


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