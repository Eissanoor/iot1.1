const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Admin signup controller
exports.signup = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({ 
        error: 'Email, username, and password are required' 
      });
    }
    
    // Check if email already exists
    const existingEmail = await Admin.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ 
        error: 'Email already in use' 
      });
    }
    
    // Check if username already exists
    const existingUsername = await Admin.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ 
        error: 'Username already taken' 
      });
    }
    
    // Create new admin
    const admin = await Admin.create({
      email,
      username,
      password
    });
    
    // Create JWT token
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return admin info (excluding password) and token
    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username
      },
      token
    });
  } catch (error) {
    console.error('Error during admin signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Find admin by email
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }
    
    // Verify password
    const isPasswordValid = await Admin.verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }
    
    // Generate token and send response
    generateTokenAndResponse(admin, res);
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to generate token and response
function generateTokenAndResponse(admin, res) {
  // Create JWT token
  const token = jwt.sign(
    { adminId: admin.id, email: admin.email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  // Return admin info and token
  return res.status(200).json({
    message: 'Login successful',
    admin: {
      id: admin.id,
      email: admin.email,
      username: admin.username
    },
    token
  });
}

// Get current admin info
exports.getMe = async (req, res) => {
  try {
    // The admin ID comes from the authenticated request
    const adminId = req.admin.adminId;
    
    // Find admin by ID
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ 
        error: 'Admin not found' 
      });
    }
    
    // Return admin info (excluding password)
    res.status(200).json({
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Error getting admin info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 