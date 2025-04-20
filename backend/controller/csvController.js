const fs = require("fs");
const csvParser = require("csv-parser");
const CsvUpload = require("../models/CsvUpload");
const uploadCsvMiddleware = require("../middleware/multerMiddleware");
const jwt = require("jsonwebtoken");

exports.uploadCsv = async (req, res) => {
    const token = req.headers.authorization;
    console.log("Token received:", token);
  
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }
  
    try {
      const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
      req.user = decoded;
  
      uploadCsvMiddleware(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message });
        }
  
        try {
          const userId = req.user.id; // Extract user ID from token
  
          if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
          }
  
          const { filename, path: filePath, size } = req.file;
          const { access = "restricted", sharedWith = [] } = req.body; // Default access: 'none', sharedWith as empty array
  
          // Validate access type
          const validAccessTypes = ["viewer", "editor", "restricted"];
          if (!validAccessTypes.includes(access)) {
            return res.status(400).json({ success: false, message: "Invalid access type" });
          }
  
          // Parse CSV File
          const parseCSV = () => {
            return new Promise((resolve, reject) => {
              const results = [];
              let headers = [];
  
              fs.createReadStream(filePath)
                .pipe(csvParser())
                .on("headers", (headerRow) => {
                  headers = headerRow.map((header) => header.trim());
                })
                .on("data", (row) => {
                  const cleanedRow = {};
                  headers.forEach((header) => {
                    cleanedRow[header] = row[header] ? row[header].trim() : "";
                  });
                  results.push(cleanedRow);
                })
                .on("end", () => resolve(results))
                .on("error", reject);
            });
          };
  
          const results = await parseCSV();
  
          // Check if file already exists for the user
          let existingFile = await CsvUpload.findOne({ where: { filename, user_id: userId } });
  
          if (existingFile) {
            // Update the existing file with the new access value and sharedWith info
            existingFile.generalAccessType = access;
         
            existingFile.update_date = new Date();
            await existingFile.save();
          } else {
            // Create a new file record using the provided access value
            existingFile = await CsvUpload.create({
              filename,
              original_name: req.file.originalname,
              file_size: size,
              user_id: userId,
              upload_date: new Date(),
              update_date: new Date(),
              generalAccessType: access,
        
            });
          }
  
          res.status(200).json({
            success: true,
            message: "File uploaded and processed successfully",
            file: existingFile,
            totalRecords: results.length,
            data: results,
          });
        } catch (error) {
          console.error("Upload Error:", error);
          res.status(500).json({ success: false, message: "Server error during file upload" });
        }
      });
    } catch (error) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
  };