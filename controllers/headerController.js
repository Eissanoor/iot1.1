const Header = require('../models/header');
const {createError} = require('../utils/createError');

// Create a new header
exports.createHeader = async (req, res, next) => {
  try {
    const { name, name_ar, url, status } = req.body;
    
    // Validate required fields
    if (!name || !name_ar || !url) {
      return next(createError(400, 'Name, Arabic name, and URL are required'));
    }
    
    const headerData = {
      name,
      name_ar,
      url,
      status: status !== undefined ? status : true
    };
    
    const header = await Header.create(headerData);
    
    res.status(201).json({
      success: true,
      data: header
    });
  } catch (error) {
    next(error);
  }
};

// Get all headers
exports.getAllHeaders = async (req, res, next) => {
  try {
    const headers = await Header.findAll();
    
    res.status(200).json({
      success: true,
      count: headers.length,
      data: headers
    });
  } catch (error) {
    next(error);
  }
};

// Get a single header by ID
exports.getHeaderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const header = await Header.findById(id);
    
    if (!header) {
      return next(createError(404, `Header with id ${id} not found`));
    }
    
    res.status(200).json({
      success: true,
      data: header
    });
  } catch (error) {
    next(error);
  }
};

// Update a header
exports.updateHeader = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, name_ar, url, status } = req.body;
    
    // Check if header exists
    const existingHeader = await Header.findById(id);
    
    if (!existingHeader) {
      return next(createError(404, `Header with id ${id} not found`));
    }
    
    // Update header data
    const updatedHeader = await Header.update(id, {
      name: name || existingHeader.name,
      name_ar: name_ar || existingHeader.name_ar,
      url: url || existingHeader.url,
      status: status !== undefined ? status : existingHeader.status
    });
    
    res.status(200).json({
      success: true,
      data: updatedHeader
    });
  } catch (error) {
    next(error);
  }
};

// Delete a header
exports.deleteHeader = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if header exists
    const header = await Header.findById(id);
    
    if (!header) {
      return next(createError(404, `Header with id ${id} not found`));
    }
    
    await Header.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Header deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update header status
exports.updateHeaderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status === undefined) {
      return next(createError(400, 'Status is required'));
    }
    
    // Check if header exists
    const header = await Header.findById(id);
    
    if (!header) {
      return next(createError(404, `Header with id ${id} not found`));
    }
    
    const updatedHeader = await Header.updateStatus(id, status);
    
    res.status(200).json({
      success: true,
      data: updatedHeader
    });
  } catch (error) {
    next(error);
  }
};
