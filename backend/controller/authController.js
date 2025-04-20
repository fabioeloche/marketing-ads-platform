const User = require('../models/User');
const { comparePassword } = require('../utils/passwordEncrypt');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
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

    async login(req, res) {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
    
          const { email, password } = req.body;
    
          // Check if the user exists
          const user = await User.findOne({ where: { email } });
          if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
          }
    
          // Verify password
          const isMatch = await comparePassword(password, user.password);
          if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
          }
    
          // Generate JWT token
          const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );
    
          return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              is_admin: user.is_admin,
    
            },
            
          });
        } catch (error) {
          console.error('Login Error:', error);
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
  