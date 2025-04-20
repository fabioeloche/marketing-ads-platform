const CsvUpload = require('../models/CsvUpload');

exports.updateGeneralAccess = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { accessType } = req.body;
    const userId = req.user.id;
    

    if (!['viewer', 'editor', 'restricted'].includes(accessType)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid access type' });
    }

    const file = await CsvUpload.findByPk(fileId);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: 'File not found' });
    }

    // Use file.user_id (not file.uploadedBy) for owner comparison
    if (String(file.user_id) !== String(userId)) {
      return res
        .status(403)
        .json({ success: false, message: 'Only file owner can change access' });
    }

    file.generalAccessType = accessType;
    await file.save();

    return res
      .status(200)
      .json({
        success: true,
        message: 'Access updated successfully',
        accessType,
      });
  } catch (error) {
    console.error('Error updating general access:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
