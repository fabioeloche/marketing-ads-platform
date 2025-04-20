const User = require('../models/User');
const { validationResult } = require('express-validator');
const { hashPassword } = require('../utils/passwordEncrypt');

class AuthController {
    async register(req, res) {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
  
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ where: { email } });
  
        if (existingUser) {
          return res.status(400).json({ message: 'Email already exists' });
        }
  
        const hashedPassword = await hashPassword(password);
        await User.create({ name, email, password: hashedPassword });
  
        return res.status(201).json({
          success: true,
          message: 'User registered successfully',
        });
      } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    }
  }
  
  module.exports = new AuthController();
  