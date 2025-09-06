const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { getImageUrl } = require('../utils/uploadUtils');

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
    
    // Check if NFC number is already in use (if provided and NFC is enabled)
    // If isNfcEnable is false, we won't check for NFC number uniqueness
    if (nfcNumber && (isNfcEnable === true || isNfcEnable === undefined)) {
      const existingNfc = await User.findByNfcNumber(nfcNumber);
      if (existingNfc) {
        return res.status(400).json({ 
          error: 'NFC number already in use' 
        });
      }
    }
    
    // Create new user - if isNfcEnable is false, set nfcNumber to null regardless of input
    const user = await User.create({
      email,
      username,
      password,
      isNfcEnable: isNfcEnable || false,
      nfcNumber: isNfcEnable === false ? null : (nfcNumber || null)
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
      user:user
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
    
    // If NFC is being disabled, automatically set nfcNumber to null
    let updatedNfcNumber = nfcNumber;
    if (isNfcEnable === false) {
      updatedNfcNumber = null;
    } else if (nfcNumber && nfcNumber !== user.nfcNumber) {
      // Only check for existing NFC if NFC is enabled and number is changing
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
      nfcNumber: isNfcEnable === false ? null : (updatedNfcNumber !== undefined ? updatedNfcNumber : user.nfcNumber)
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

// Update user profile with optional fields
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      firstName,
      lastName,
      cr_number,
      cr_activity,
      company_name_eng,
      company_name_arabic,
      company_landline,
      business_type,
      zip_code,
      industry_types,
      country,
      state,
      city,
      membership_category,
      user_source,
      tin_number,
      gps_location,
      latitude,
      longitude,
      phoneNo,
      dateOfBirth,
      gender,
      displayName,
      bio,
      language,
      emailNotification,
      smsAlert,
      pushNotification,
      buildingNumber,
      companySize,
      website,
      bAddress,
      bBuildingNumber,
      bCountry,
      bState,
      bCity,
      bZipCode,
      vatNumber,
      commercialRegistration
    } = req.body;
    
    // Handle uploaded image file - store full path
    const image = req.file ? getImageUrl(req.file.filename) : undefined;
    
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }
    
    // Helper function to convert string booleans to actual booleans
    const convertToBoolean = (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
      }
      return null; // Invalid value
    };

    // Validate and convert boolean notification fields
    let convertedEmailNotification, convertedSmsAlert, convertedPushNotification;
    
    if (emailNotification !== undefined) {
      convertedEmailNotification = convertToBoolean(emailNotification);
      if (convertedEmailNotification === null) {
        return res.status(400).json({
          error: 'emailNotification must be a boolean value (true or false)'
        });
      }
    }
    
    if (smsAlert !== undefined) {
      convertedSmsAlert = convertToBoolean(smsAlert);
      if (convertedSmsAlert === null) {
        return res.status(400).json({
          error: 'smsAlert must be a boolean value (true or false)'
        });
      }
    }
    
    if (pushNotification !== undefined) {
      convertedPushNotification = convertToBoolean(pushNotification);
      if (convertedPushNotification === null) {
        return res.status(400).json({
          error: 'pushNotification must be a boolean value (true or false)'
        });
      }
    }

    // Prepare update data - only include fields that are provided
    const updateData = {};
    
    // Add fields to update data only if they are provided in the request
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (cr_number !== undefined) updateData.cr_number = cr_number;
    if (cr_activity !== undefined) updateData.cr_activity = cr_activity;
    if (company_name_eng !== undefined) updateData.company_name_eng = company_name_eng;
    if (company_name_arabic !== undefined) updateData.company_name_arabic = company_name_arabic;
    if (company_landline !== undefined) updateData.company_landline = company_landline;
    if (business_type !== undefined) updateData.business_type = business_type;
    if (zip_code !== undefined) updateData.zip_code = zip_code;
    if (industry_types !== undefined) updateData.industry_types = industry_types;
    if (country !== undefined) updateData.country = country;
    if (state !== undefined) updateData.state = state;
    if (city !== undefined) updateData.city = city;
    if (membership_category !== undefined) updateData.membership_category = membership_category;
    if (user_source !== undefined) updateData.user_source = user_source;
    if (tin_number !== undefined) updateData.tin_number = tin_number;
    if (image !== undefined) updateData.image = image;
    if (gps_location !== undefined) updateData.gps_location = gps_location;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    
    // Additional profile fields
    if (phoneNo !== undefined) updateData.phoneNo = phoneNo;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (language !== undefined) updateData.language = language;
    if (emailNotification !== undefined) updateData.emailNotification = convertedEmailNotification;
    if (smsAlert !== undefined) updateData.smsAlert = convertedSmsAlert;
    if (pushNotification !== undefined) updateData.pushNotification = convertedPushNotification;
    if (buildingNumber !== undefined) updateData.buildingNumber = buildingNumber;
    if (companySize !== undefined) updateData.companySize = companySize;
    if (website !== undefined) updateData.website = website;
    if (bAddress !== undefined) updateData.bAddress = bAddress;
    if (bBuildingNumber !== undefined) updateData.bBuildingNumber = bBuildingNumber;
    if (bCountry !== undefined) updateData.bCountry = bCountry;
    if (bState !== undefined) updateData.bState = bState;
    if (bCity !== undefined) updateData.bCity = bCity;
    if (bZipCode !== undefined) updateData.bZipCode = bZipCode;
    if (vatNumber !== undefined) updateData.vatNumber = vatNumber;
    if (commercialRegistration !== undefined) updateData.commercialRegistration = commercialRegistration;
    
    // Validate business_type if provided
    if (business_type && !['organization', 'individual', 'family business'].includes(business_type)) {
      return res.status(400).json({
        error: 'Invalid business_type. Must be one of: organization, individual, family business'
      });
    }
    
    // Validate gender if provided
    if (gender && !['male', 'female', 'other'].includes(gender.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid gender. Must be one of: male, female, other'
      });
    }
    
    // Validate dateOfBirth format if provided
    if (dateOfBirth && isNaN(Date.parse(dateOfBirth))) {
      return res.status(400).json({
        error: 'Invalid dateOfBirth format. Please provide a valid date'
      });
    }
    
    // Validate industry_types if provided (should be valid JSON string)
    if (industry_types) {
      try {
        JSON.parse(industry_types);
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid industry_types format. Must be a valid JSON string'
        });
      }
    }
    
    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No fields provided for update'
      });
    }
    
    // Update user profile
    const updatedUser = await User.updateById(userId, updateData);
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        isNfcEnable: updatedUser.isNfcEnable,
        nfcNumber: updatedUser.nfcNumber,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        cr_number: updatedUser.cr_number,
        cr_activity: updatedUser.cr_activity,
        company_name_eng: updatedUser.company_name_eng,
        company_name_arabic: updatedUser.company_name_arabic,
        company_landline: updatedUser.company_landline,
        business_type: updatedUser.business_type,
        zip_code: updatedUser.zip_code,
        industry_types: updatedUser.industry_types,
        country: updatedUser.country,
        state: updatedUser.state,
        city: updatedUser.city,
        membership_category: updatedUser.membership_category,
        user_source: updatedUser.user_source,
        tin_number: updatedUser.tin_number,
        image: updatedUser.image,
        gps_location: updatedUser.gps_location,
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
        phoneNo: updatedUser.phoneNo,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        language: updatedUser.language,
        emailNotification: updatedUser.emailNotification,
        smsAlert: updatedUser.smsAlert,
        pushNotification: updatedUser.pushNotification,
        buildingNumber: updatedUser.buildingNumber,
        companySize: updatedUser.companySize,
        website: updatedUser.website,
        bAddress: updatedUser.bAddress,
        bBuildingNumber: updatedUser.bBuildingNumber,
        bCountry: updatedUser.bCountry,
        bState: updatedUser.bState,
        bCity: updatedUser.bCity,
        bZipCode: updatedUser.bZipCode,
        vatNumber: updatedUser.vatNumber,
        commercialRegistration: updatedUser.commercialRegistration
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};