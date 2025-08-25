const DemoRequest = require('../models/demoRequest');
const { sendDemoRequestEmail } = require('../utils/emailUtils');
const createError = require('../utils/createError');

// Create a new demo request
exports.createDemoRequest = async (req, res, next) => {
  try {
    const { email, phoneNumber, companyName, message } = req.body;

    // Validate required fields
    if (!email || !phoneNumber || !companyName) {
      return next(createError(400, 'Email, phone number, and company name are required'));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(createError(400, 'Invalid email format'));
    }

    // Create demo request in database
    const demoRequest = await DemoRequest.create({
      email,
      phoneNumber,
      companyName,
      message
    });

    // Send email notification
    const emailResult = await sendDemoRequestEmail({
      email,
      phoneNumber,
      companyName,
      message
    });
    
    // We don't need to handle errors here since our sendDemoRequestEmail function
    // already handles errors internally and doesn't throw them

    res.status(201).json({
      success: true,
      message: 'Demo request submitted successfully',
      data: demoRequest
    });
  } catch (error) {
    next(error);
  }
};

// Get all demo requests (admin only)
exports.getAllDemoRequests = async (req, res, next) => {
  try {
    const demoRequests = await DemoRequest.getAll();
    
    res.status(200).json({
      success: true,
      count: demoRequests.length,
      data: demoRequests
    });
  } catch (error) {
    next(error);
  }
};

// Get a single demo request by ID (admin only)
exports.getDemoRequestById = async (req, res, next) => {
  try {
    const demoRequest = await DemoRequest.getById(req.params.id);
    
    if (!demoRequest) {
      return next(createError(404, 'Demo request not found'));
    }
    
    res.status(200).json({
      success: true,
      data: demoRequest
    });
  } catch (error) {
    next(error);
  }
};

// Update demo request status (admin only)
exports.updateDemoRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'contacted', 'completed'].includes(status)) {
      return next(createError(400, 'Invalid status value'));
    }
    
    const demoRequest = await DemoRequest.update(req.params.id, { status });
    
    if (!demoRequest) {
      return next(createError(404, 'Demo request not found'));
    }
    
    res.status(200).json({
      success: true,
      data: demoRequest
    });
  } catch (error) {
    next(error);
  }
};

// Delete a demo request (admin only)
exports.deleteDemoRequest = async (req, res, next) => {
  try {
    const demoRequest = await DemoRequest.delete(req.params.id);
    
    if (!demoRequest) {
      return next(createError(404, 'Demo request not found'));
    }
    
    res.status(200).json({
      success: true,
      message: 'Demo request deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
