const fs = require('fs');
const path = require('path');
const { QueryTypes } = require('sequelize'); // Ensure QueryTypes is imported
const sequelize = require('../config/db'); // Import the sequelize instance
const csvParser = require('csv-parser');

class AdsController {
  

    async getAllAds(req, res) {
      try {
        const userId = req.user.id; // Assuming you have user authentication and req.user contains user info
        // const token = req.headers.authorization;
        // if (!token) {
        //   return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        // }
        
        const files = await sequelize.query(
          `SELECT id, filename, original_name, upload_date, update_date
           FROM csv_uploads 
           WHERE user_id = :userId
           ORDER BY upload_date DESC`,
          { 
            type: QueryTypes.SELECT, 
            replacements: { userId } 
          }
        );
    
        if (!files.length) {
          return res
            .status(404)
            .json({ success: false, message: 'No CSV files found for this user' });
        }
    
        const fileMetadata = files.map((file) => ({
          fileId: file.id,
          filename: file.original_name, // Use original name for better readability
          upload_date: file.upload_date,
          update_date: file.update_date,
          source: 'Unknown', // Set source as "Unknown"
        }));
    
        res.status(200).json({
          success: true,
          message: 'Files retrieved successfully',
          data: fileMetadata,
        });
      } catch (error) {
        console.error('Get User Files Error:', error);
        res.status(500).json({
          success: false,
          message: 'Server error while retrieving user files',
        });
      }
    }

    async getAdsFileId(req, res) {
        try {
          const { fileId } = req.params;
      
          if (!fileId) {
            return res
              .status(400)
              .json({ success: false, message: "File ID is required" });
          }
      
          const file = await sequelize.query(
            `SELECT id, filename, original_name, file_size, user_id, upload_date,generalAccessType
             FROM csv_uploads 
             WHERE id = :fileId`,
            { type: QueryTypes.SELECT, replacements: { fileId } }
          );
      
          if (!file.length) {
            return res
              .status(404)
              .json({ success: false, message: "CSV file not found" });
          }
      
          const fileData = file[0];
          const filePath = path.join(__dirname, "../uploads", fileData.filename);
      
          if (!fs.existsSync(filePath) || fileData.file_size === 0) {
            return res
              .status(404)
              .json({ success: false, message: "File does not exist or is empty" });
          }
      
          const results = [];
          let headers = [];
          let rowCount = 0; // Track number of rows
      
          fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("headers", (headerRow) => {
              headers = headerRow.map((header) => header.trim()); // Clean headers
            })
            .on("data", (row) => {
              rowCount++; // Increment row counter
              const cleanedRow = {};
      
              headers.forEach((header) => {
                cleanedRow[header] = row[header] ? row[header].trim() : ""; // Clean row values
              });
      
              results.push(cleanedRow);
            })
            .on("end", () => {
              console.log(`Total rows processed: ${rowCount}`); // Log total rows
              res.status(200).json({
                success: true,
                message: "Ads retrieved successfully",
                fileMetadata: {
                  fileId: fileData.id,
                  filename: fileData.original_name,
                  fileSize: fileData.file_size,
                  uploadedBy: fileData.user_id,
                  uploadedAt: fileData.upload_date,
                  access: fileData.generalAccessType,
                 
                },
                totalRecords: results.length,
                data: results,
              });
            })
            .on("error", (error) => {
              console.error("CSV Parsing Error:", error);
              res
                .status(500)
                .json({ success: false, message: "Error processing CSV file" });
            });
        } catch (error) {
          console.error("Get Ads by File ID Error:", error);
          res
            .status(500)
            .json({ success: false, message: "Server error while retrieving ads" });
        }
      }
    
    
  }
  module.exports = new AdsController();
  