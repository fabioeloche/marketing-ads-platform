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

  async deleteUser(req, res) {
    const { userId } = req.params;

    try {
        // 1. Verify user exists
        const userRecord = await sequelize.query(
            `SELECT id, email FROM users WHERE id = :userId`,
            { type: QueryTypes.SELECT, replacements: { userId } }
        );

        if (!userRecord.length) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found in database." 
            });
        }

        // 2. Delete all user's files from filesystem and database
        const userFiles = await sequelize.query(
            `SELECT filename FROM csv_uploads WHERE user_id = :userId`,
            { type: QueryTypes.SELECT, replacements: { userId } }
        );

        // Delete physical files
        for (const file of userFiles) {
            const filePath = path.join(__dirname, "../uploads", file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // 3. Delete database records (in transaction)
        await sequelize.transaction(async (transaction) => {
            // Delete user's files
            await sequelize.query(
                `DELETE FROM csv_uploads WHERE user_id = :userId`,
                { 
                    type: QueryTypes.DELETE, 
                    replacements: { userId },
                    transaction 
                }
            );

            // Delete user
            await sequelize.query(
                `DELETE FROM users WHERE id = :userId`,
                { 
                    type: QueryTypes.DELETE, 
                    replacements: { userId },
                    transaction 
                }
            );
        });

        // 4. Log the action
        console.log(`Deleted user ${userRecord[0].email} (ID: ${userId}) and ${userFiles.length} files`);

        res.json({ 
            success: true, 
            message: "User and all associated files deleted successfully.",
            deletedFilesCount: userFiles.length
        });

    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error during user deletion.",
            error: error.message 
        });
    }
}

}



module.exports = new AdminController();