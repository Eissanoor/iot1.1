const User = require('../models/user');
const jwt = require('jsonwebtoken');

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { email, username, password, isNfcEnable, nfcNumber } = req.body;
    
    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({ 
        error: 'Email, username, and password are required' 
      });
    }
    
    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ 
        error: 'Email already in use' 
      });
    }
    
    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ 
        error: 'Username already taken' 
      });
    }
    
    // Check if NFC number is already in use (if provided)
    if (nfcNumber) {
      const existingNfc = await User.findByNfcNumber(nfcNumber);
      if (existingNfc) {
        return res.status(400).json({ 
          error: 'NFC number already in use' 
        });
      }
    }
    
    // Create new user
    const user = await User.create({
      email,
      username,
      password,
      isNfcEnable: isNfcEnable || false,
      nfcNumber: nfcNumber || null
    });
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info (excluding password) and token
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isNfcEnable: user.isNfcEnable,
        nfcNumber: user.nfcNumber
      },
      token
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login controller (traditional login with email/password)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }
    
    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }
    
    // Generate token and send response
    generateTokenAndResponse(user, res);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// NFC login controller - separate endpoint specifically for NFC login
exports.loginWithNfc = async (req, res) => {
  try {
    const { nfcNumber } = req.body;
    
    // Validate input
    if (!nfcNumber) {
      return res.status(400).json({ 
        error: 'NFC number is required' 
      });
    }
    
    // Find user by NFC number
    const user = await User.findByNfcNumber(nfcNumber);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid NFC card' 
      });
    }
    
    // Check if NFC login is enabled for this user
    if (!user.isNfcEnable) {
      return res.status(401).json({ 
        error: 'NFC login is not enabled for this user' 
      });
    }
    
    // Generate token and send response
    generateTokenAndResponse(user, res);
  } catch (error) {
    console.error('Error during NFC login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to generate token and response
function generateTokenAndResponse(user, res) {
  // Create JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  // Return user info and token
  return res.status(200).json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      isNfcEnable: user.isNfcEnable,
      nfcNumber: user.nfcNumber
    },
    token
  });
}

// Get current user info
exports.getMe = async (req, res) => {
  try {
    // The user ID comes from the authenticated request
    const userId = req.user.userId;
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    // Return user info (excluding password)
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isNfcEnable: user.isNfcEnable,
        nfcNumber: user.nfcNumber
      }
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update NFC settings
exports.updateNfcSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { isNfcEnable, nfcNumber } = req.body;
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    // Check if NFC number is already in use (if provided and changed)
    if (nfcNumber && nfcNumber !== user.nfcNumber) {
      const existingNfc = await User.findByNfcNumber(nfcNumber);
      if (existingNfc) {
        return res.status(400).json({ 
          error: 'NFC number already in use' 
        });
      }
    }
    
    // Update user NFC settings
    const updatedUser = await User.updateById(userId, {
      isNfcEnable: isNfcEnable !== undefined ? isNfcEnable : user.isNfcEnable,
      nfcNumber: nfcNumber !== undefined ? nfcNumber : user.nfcNumber
    });
    
    res.status(200).json({
      message: 'NFC settings updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        isNfcEnable: updatedUser.isNfcEnable,
        nfcNumber: updatedUser.nfcNumber
      }
    });
  } catch (error) {
    console.error('Error updating NFC settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 