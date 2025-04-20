const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create folder if it doesn't exist
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `upload_${Date.now()}.csv`);
  },
});

// File filter to allow only CSV files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"), false);
  }
};

// Multer instance with limits
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Export middleware for single CSV upload
module.exports = upload.single("csvFile");
