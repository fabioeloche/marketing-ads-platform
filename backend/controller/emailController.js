const nodemailer = require("nodemailer");
const sequelize = require("../config/db");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

exports.shareFileByEmail = async (req, res) => {
    const { fileId, recipientEmail, senderName, message, fileName } = req.body;
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }
  
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      const userId = decoded.id;
  
      // Fetch the file from the database using the new query
      const file = await sequelize.query(
        `SELECT id, filename, original_name, file_size, user_id, upload_date, generalAccessType
         FROM csv_uploads 
         WHERE id = :fileId`,
        { type: QueryTypes.SELECT, replacements: { fileId } }
      );
  
      if (!file.length) {
        return res.status(404).json({ success: false, message: "File not found or access denied" });
      }
  
      // Generate the share link
      const shareLink = `${process.env.FRONTEND_URL}/EditAds/${fileId}`;
  
      // Configure email transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
          
        },
      });
  
      // Send email
      await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: recipientEmail,
        subject: `${senderName} shared a file with you: ${fileName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>File Shared with You</h2>
            <p>${senderName} has shared a file "${fileName}" with you.</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
            <p>Click the button below to view the file:</p>
            <p style="text-align: center;">
              <a href="${shareLink}" style="display: inline-block; background-color: #f97316; color: #000; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 9999px;">
                View File
              </a>
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser: ${shareLink}
            </p>
          </div>
        `,
      });
  
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, message: "Failed to send email" });
    }
  };
  