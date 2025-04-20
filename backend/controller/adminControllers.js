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

}



module.exports = new AdminController();