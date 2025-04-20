const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" })); // Allow JSON payloads
app.use(express.urlencoded({ extended: true, limit: "5mb" })); // Allow form-data


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});