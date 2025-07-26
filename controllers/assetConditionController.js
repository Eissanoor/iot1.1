const AssetCondition = require('../models/assetCondition');

// Create a new asset condition
exports.createAssetCondition = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Asset condition name is required' });
    }

    const assetCondition = await AssetCondition.create({
      name,
      description,
      status: status !== undefined ? status : true
    });

    res.status(201).json({
      success: true,
      data: assetCondition,
      message: 'Asset condition created successfully'
    });
  } catch (error) {
    console.error('Error creating asset condition:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'An asset condition with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create asset condition',
      error: error.message
    });
  }
};

// Get all asset conditions with pagination
exports.getAllAssetConditions = async (req, res) => {
  try {
    // Extract pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100.'
      });
    }
    
    const result = await AssetCondition.findAll(page, limit);
    
    res.status(200).json({
      success: true,
      count: result.assetConditions.length,
      pagination: result.pagination,
      data: result.assetConditions
    });
  } catch (error) {
    console.error('Error fetching asset conditions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset conditions',
      error: error.message
    });
  }
};

// Get a single asset condition by ID
exports.getAssetConditionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assetCondition = await AssetCondition.findById(id);
    
    if (!assetCondition) {
      return res.status(404).json({
        success: false,
        message: 'Asset condition not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: assetCondition
    });
  } catch (error) {
    console.error('Error fetching asset condition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset condition',
      error: error.message
    });
  }
};

// Update an asset condition
exports.updateAssetCondition = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    
    // Check if asset condition exists
    const existingAssetCondition = await AssetCondition.findById(id);
    
    if (!existingAssetCondition) {
      return res.status(404).json({
        success: false,
        message: 'Asset condition not found'
      });
    }
    
    // Update asset condition
    const updatedAssetCondition = await AssetCondition.update(id, {
      name: name !== undefined ? name : existingAssetCondition.name,
      description: description !== undefined ? description : existingAssetCondition.description,
      status: status !== undefined ? status : existingAssetCondition.status
    });
    
    res.status(200).json({
      success: true,
      data: updatedAssetCondition,
      message: 'Asset condition updated successfully'
    });
  } catch (error) {
    console.error('Error updating asset condition:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'An asset condition with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update asset condition',
      error: error.message
    });
  }
};

// Delete an asset condition
exports.deleteAssetCondition = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if asset condition exists
    const existingAssetCondition = await AssetCondition.findById(id);
    
    if (!existingAssetCondition) {
      return res.status(404).json({
        success: false,
        message: 'Asset condition not found'
      });
    }
    
    // Delete asset condition
    await AssetCondition.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Asset condition deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting asset condition:', error);
    
    // Handle foreign key constraint violation
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete asset condition as it is referenced by other records'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete asset condition',
      error: error.message
    });
  }
}; 