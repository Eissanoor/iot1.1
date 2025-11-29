const PermissionCategory = require('../models/permissionCategory');

// Create a new permission category
exports.createPermissionCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    // Validate input
    if (!name || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and status are required' 
      });
    }

    const category = await PermissionCategory.create({
      name,
      status,
    });

    return res.status(201).json({
      success: true,
      data: category,
      message: 'Permission category created successfully'
    });
  } catch (error) {
    console.error('Error creating permission category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create permission category',
      error: error.message
    });
  }
};

// Get all permission categories
exports.getAllPermissionCategories = async (req, res) => {
  try {
    const categories = await PermissionCategory.findAll();
    
    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching permission categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch permission categories',
      error: error.message
    });
  }
};

// Get permission category by ID
exports.getPermissionCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await PermissionCategory.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Permission category with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching permission category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch permission category',
      error: error.message
    });
  }
};

// Update permission category
exports.updatePermissionCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    
    // Check if category exists
    const existingCategory = await PermissionCategory.findById(id);
    
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: `Permission category with ID ${id} not found`
      });
    }
    
    // Update category
    const updatedCategory = await PermissionCategory.update(id, {
      name: name !== undefined ? name : existingCategory.name,
      status: status !== undefined ? status : existingCategory.status,
    });
    
    return res.status(200).json({
      success: true,
      data: updatedCategory,
      message: 'Permission category updated successfully'
    });
  } catch (error) {
    console.error('Error updating permission category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update permission category',
      error: error.message
    });
  }
};

// Delete permission category
exports.deletePermissionCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const category = await PermissionCategory.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Permission category with ID ${id} not found`
      });
    }
    
    // Delete category
    await PermissionCategory.delete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Permission category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting permission category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete permission category',
      error: error.message
    });
  }
};

