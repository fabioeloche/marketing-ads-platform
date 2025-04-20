const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { QueryTypes } = require('sequelize');

class AuthMiddleware {
 
  async protect(req, res, next) {
    try {
    console.log(req);
      const authHeader = req.header("Authorization");
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please provide a token",
          code: "NO_TOKEN"
        });
      }

 
      const [bearer, token] = authHeader.split(' ');
      if (bearer !== 'Bearer' || !token) {
        return res.status(401).json({
          success: false,
          message: "Invalid authorization format. Use 'Bearer <token>'",
          code: "INVALID_FORMAT"
        });
      }

  
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, {
          algorithms: ['HS256']
        });
        
        // 4. Validate required payload fields
        if (!decoded.id) {
          return res.status(401).json({
            success: false,
            message: "Invalid token payload. Missing required fields",
            code: "INVALID_PAYLOAD"
          });
        }

        // 5. Check if user exists - only selecting columns that exist
        const user = await db.query(
          `SELECT id, name, email, created_at 
           FROM users 
           WHERE id = ?
           LIMIT 1`,
          {
            replacements: [decoded.id],
            type: QueryTypes.SELECT
          }
        );

        if (!user.length) {
          return res.status(401).json({
            success: false,
            message: "User account not found",
            code: "USER_NOT_FOUND"
          });
        }

        // 6. Add user and token info to request
        req.user = user[0];
        req.token = {
          issuedAt: new Date(decoded.iat * 1000),
          expiresAt: new Date(decoded.exp * 1000)
        };

        next();

      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: "Your session has expired. Please log in again",
            code: "TOKEN_EXPIRED"
          });
        }
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            message: "Invalid token signature. Please log in again",
            code: "INVALID_SIGNATURE"
          });
        }
        throw error;
      }

    } catch (error) {
      console.error('Auth Middleware Error:', error);
      return res.status(500).json({
        success: false,
        message: "Authentication failed due to server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: "SERVER_ERROR"
      });
    }
  }

  // Resource ownership middleware
  checkOwnership(resourceTable, resourceIdParam = 'id') {
    return async (req, res, next) => {
      try {
        const resourceId = req.params[resourceIdParam];
        
        if (!resourceId) {
          return res.status(400).json({
            success: false,
            message: `Resource ID parameter '${resourceIdParam}' is required`,
            code: "MISSING_RESOURCE_ID"
          });
        }

        // Sanitize table name to prevent SQL injection
        const validTableName = resourceTable.replace(/[^a-zA-Z0-9_]/g, '');
        
        const resources = await db.query(
          `SELECT * FROM ${validTableName} 
           WHERE id = ? AND user_id = ?
           LIMIT 1`,
          {
            replacements: [resourceId, req.user.id],
            type: QueryTypes.SELECT
          }
        );

        if (!resources.length) {
          return res.status(404).json({
            success: false,
            message: "Resource not found or you don't have permission to access it",
            code: "RESOURCE_NOT_FOUND"
          });
        }

        req.resource = resources[0];
        next();

      } catch (error) {
        console.error('Ownership Check Error:', error);
        return res.status(500).json({
          success: false,
          message: "Ownership verification failed due to server error",
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
          code: "OWNERSHIP_CHECK_ERROR"
        });
      }
    };
  }
}

module.exports = new AuthMiddleware();