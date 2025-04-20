const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");
const CsvUpload = require("../models/CsvUpload");
const uploadCsvMiddleware = require("../middleware/multerMiddleware");
const Papa = require("papaparse")
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

  exports.updateCsvFile = async (req, res) => {
    const { fileId } = req.params;
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }
    
    // Handle different request body formats
    let csvData;
    if (Buffer.isBuffer(req.body)) {
      csvData = req.body.toString();
    } else if (typeof req.body === 'string') {
      csvData = req.body;
    } else if (req.body && typeof req.body === 'object') {
      // Try to get the data directly
      csvData = req.body.data || req.body.csvData || JSON.stringify(req.body);
    } else {
     
      return res.status(400).json({ success: false, message: "Could not parse request body." });
    }
  
    if (!csvData) {
      return res.status(400).json({ success: false, message: "Invalid or empty CSV data." });
    }
  
    try {
      // Fetch the file name from the database
      const oldFile = await sequelize.query(
        `SELECT filename FROM csv_uploads WHERE id = :fileId`,
        { type: QueryTypes.SELECT, replacements: { fileId } }
      );
  
      if (!oldFile.length) {
        return res.status(404).json({ success: false, message: "File not found in database." });
      }
  
      const filePath = path.join(__dirname, "../uploads", oldFile[0].filename);
  
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: "File does not exist on server." });
      }
      
      // Read the original file to get headers
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const originalParsed = Papa.parse(originalContent, { header: true });
      const headers = originalParsed.meta.fields;
      
  
      // Parse the new data
      let newData;
      try {
        // First try to parse as CSV string
        const parsed = Papa.parse(csvData, { header: true });
        if (parsed.data && parsed.data.length > 0) {
          newData = parsed.data;
          console.log("Successfully parsed CSV string, found", newData.length, "rows");
        } else {
          // Try to parse as JSON
          const jsonData = typeof csvData === 'string' ? JSON.parse(csvData) : csvData;
          if (Array.isArray(jsonData)) {
            newData = jsonData;
          } else if (jsonData.data && Array.isArray(jsonData.data)) {
            newData = jsonData.data;
          } else {
            throw new Error("Could not find valid data array in the request");
          }
          console.log("Successfully parsed JSON data, found", newData.length, "rows");
        }
      } catch (parseError) {
        console.error("Parsing error:", parseError);
        return res.status(400).json({ 
          success: false, 
          message: "Failed to parse the provided data",
          error: parseError.message
        });
      }
      
      if (!newData || newData.length === 0) {
        return res.status(400).json({ success: false, message: "No valid data rows found" });
      }
      
      // Log sample data for debugging
      console.log("Sample data row:", newData[0]);
      
      // Create CSV content with the original headers
      const formattedData = newData.map(row => {
        const formattedRow = {};
        headers.forEach(header => {
          // Handle different formats of header names (with or without spaces)
          const cleanHeader = header.trim();
          // Try different variations of the key name
          let value = row[cleanHeader] ?? row[cleanHeader.replace(/_/g, ' ')] ?? 
                     row[cleanHeader.replace(/ /g, '_')] ?? '';
          
          formattedRow[header] = value;
        });
        return formattedRow;
      });
      
      // Generate the CSV
      const newCsvContent = Papa.unparse({
        fields: headers,
        data: formattedData
      });
      
      console.log("Generated CSV length:", newCsvContent.length);
      
      // Write the file with explicit encoding
      fs.writeFileSync(filePath, newCsvContent, { encoding: 'utf8' });
      
      // Verify the file was written correctly
      try {
        const stats = fs.statSync(filePath);
        console.log("File written, size:", stats.size, "bytes");
        
        if (stats.size === 0) {
          return res.status(500).json({ 
            success: false, 
            message: "File was saved but appears to be empty. Check server logs."
          });
        }
      } catch (statError) {
        console.error("Error checking file stats:", statError);
      }
  
      res.status(200).json({ success: true, message: "File updated successfully!" });
    } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server error during file update.",
        error: error.message
      });
    }
  };

  exports.deleteCsvFile = async (req, res) => {
    const { fileId } = req.params;
  
    try {
      // Check if the file exists in the database
      const fileRecord = await sequelize.query(
        `SELECT filename FROM csv_uploads WHERE id = :fileId`,
        { type: QueryTypes.SELECT, replacements: { fileId } }
      );
  
      if (!fileRecord.length) {
        return res.status(404).json({ success: false, message: "File not found in database." });
      }
  
      const filePath = path.join(__dirname, "../uploads", fileRecord[0].filename);
  
      // Delete the file from the filesystem if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.warn(`File ${filePath} not found on server, but removing from database.`);
      }
  
      // Delete the file record from the database
      await sequelize.query(
        `DELETE FROM csv_uploads WHERE id = :fileId`,
        { type: QueryTypes.DELETE, replacements: { fileId } }
      );
  
      res.json({ success: true, message: "File deleted successfully." });
    } catch (error) {
      console.error("Delete Error:", error);
      res.status(500).json({ success: false, message: "Server error during file deletion.", error: error.message });
    }
  };
  