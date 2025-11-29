const Permission = require('../models/permission');

// Create a new permission
exports.createPermission = async (req, res) => {
  try {
    const { name, categoryId, description, status } = req.body;

    // Validate input
    if (!name || !categoryId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and categoryId are required' 
      });
    }

    const prisma = require('../prisma/client');

    // Verify category exists
    const category = await prisma.permissionCategory.findUnique({
      where: { id: Number(categoryId) }
    });
    
    if (!category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Permission category with provided ID does not exist' 
      });
    }

    const permission = await Permission.create({
      name,
      categoryId: Number(categoryId),
      description: description || null,
      status: status || 'active',
    });

    return res.status(201).json({
      success: true,
      data: permission,
      message: 'Permission created successfully'
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create permission',
      error: error.message
    });
  }
};

// Get all permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    
    return res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions',
      error: error.message
    });
  }
};

// Get permissions grouped by category
exports.getPermissionsByCategory = async (req, res) => {
  try {
    const grouped = await Permission.findGroupedByCategory();
    
    return res.status(200).json({
      success: true,
      data: grouped
    });
  } catch (error) {
    console.error('Error fetching permissions by category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions by category',
      error: error.message
    });
  }
};

// Get permissions by category ID
exports.getPermissionsByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const permissions = await Permission.findByCategoryId(categoryId);
    
    return res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions by category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions',
      error: error.message
    });
  }
};

// Get permission by ID
exports.getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const permission = await Permission.findById(id);
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: `Permission with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: permission
    });
  } catch (error) {
    console.error('Error fetching permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch permission',
      error: error.message
    });
  }
};

// Update permission
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, description, status } = req.body;
    
    // Check if permission exists
    const existingPermission = await Permission.findById(id);
    
    if (!existingPermission) {
      return res.status(404).json({
        success: false,
        message: `Permission with ID ${id} not found`
      });
    }

    const prisma = require('../prisma/client');

    // If categoryId is provided, verify it exists
    if (categoryId !== undefined && categoryId !== null) {
      const category = await prisma.permissionCategory.findUnique({
        where: { id: Number(categoryId) }
      });
      
      if (!category) {
        return res.status(400).json({ 
          success: false, 
          message: 'Permission category with provided ID does not exist' 
        });
      }
    }
    
    // Update permission
    const updatedPermission = await Permission.update(id, {
      name: name !== undefined ? name : existingPermission.name,
      categoryId: categoryId !== undefined ? Number(categoryId) : existingPermission.categoryId,
      description: description !== undefined ? description : existingPermission.description,
      status: status !== undefined ? status : existingPermission.status,
    });
    
    return res.status(200).json({
      success: true,
      data: updatedPermission,
      message: 'Permission updated successfully'
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update permission',
      error: error.message
    });
  }
};

// Delete permission
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if permission exists
    const permission = await Permission.findById(id);
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: `Permission with ID ${id} not found`
      });
    }
    
    // Delete permission
    await Permission.delete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete permission',
      error: error.message
    });
  }
};

