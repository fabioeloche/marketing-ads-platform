const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");


class AdminController {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await sequelize.query(
        `SELECT id, name, email, created_at 
         FROM users 
         ORDER BY created_at DESC`,
        { type: QueryTypes.SELECT }
      );

      if (!users.length) {
        return res.status(404).json({
          success: false,
          message: 'No users found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users
      });
    } catch (error) {
      console.error('Get All Users Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while retrieving users'
      });
    }
  }

  // Get files for a specific user
  async getUserFiles(req, res) {
    try {
      const userId = req.params.userId;

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
        return res.status(404).json({
          success: false,
          message: 'No files found for this user'
        });
      }

      const fileMetadata = files.map((file) => ({
        id: file.id,
        name: file.original_name,
        uploadedAt: file.upload_date,
        updatedAt: file.update_date
      }));

      res.status(200).json({
        success: true,
        message: 'User files retrieved successfully',
        data: fileMetadata
      });
    } catch (error) {
      console.error('Get User Files Error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while retrieving user files'
      });
    }
  }

}



module.exports = new AdminController();