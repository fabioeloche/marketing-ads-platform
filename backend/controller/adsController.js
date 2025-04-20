const { QueryTypes } = require('sequelize'); // Ensure QueryTypes is imported
const sequelize = require('../config/db'); // Import the sequelize instance

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
    
    
  }
  module.exports = new AdsController();
  