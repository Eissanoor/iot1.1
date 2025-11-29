const AccessLevel = require('../models/accessLevel');

// Create a new access level
exports.createAccessLevel = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validate input
    if (!name || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and status are required' 
      });
    }

    const accessLevel = await AccessLevel.create({
      name,
      status,
    });

    return res.status(201).json({
      success: true,
      data: accessLevel,
      message: 'Access level created successfully'
    });
  } catch (error) {
    console.error('Error creating access level:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create access level',
      error: error.message
    });
  }
};

// Get all access levels
exports.getAllAccessLevels = async (req, res) => {
  try {
    const accessLevels = await AccessLevel.findAll();
    
    return res.status(200).json({
      success: true,
      count: accessLevels.length,
      data: accessLevels
    });
  } catch (error) {
    console.error('Error fetching access levels:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch access levels',
      error: error.message
    });
  }
};

// Get access level by ID
exports.getAccessLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const accessLevel = await AccessLevel.findById(id);
    
    if (!accessLevel) {
      return res.status(404).json({
        success: false,
        message: `Access level with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: accessLevel
    });
  } catch (error) {
    console.error('Error fetching access level:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch access level',
      error: error.message
    });
  }
};

// Update access level
exports.updateAccessLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    
    // Check if access level exists
    const existingAccessLevel = await AccessLevel.findById(id);
    
    if (!existingAccessLevel) {
      return res.status(404).json({
        success: false,
        message: `Access level with ID ${id} not found`
      });
    }
    
    // Update access level
    const updatedAccessLevel = await AccessLevel.update(id, {
      name: name !== undefined ? name : existingAccessLevel.name,
      status: status !== undefined ? status : existingAccessLevel.status,
    });
    
    return res.status(200).json({
      success: true,
      data: updatedAccessLevel,
      message: 'Access level updated successfully'
    });
  } catch (error) {
    console.error('Error updating access level:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update access level',
      error: error.message
    });
  }
};

// Delete access level
exports.deleteAccessLevel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if access level exists
    const accessLevel = await AccessLevel.findById(id);
    
    if (!accessLevel) {
      return res.status(404).json({
        success: false,
        message: `Access level with ID ${id} not found`
      });
    }
    
    // Delete access level
    await AccessLevel.delete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Access level deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting access level:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete access level',
      error: error.message
    });
  }
};

