const Role = require('../models/role');

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const { name, status, description, accessLevelId } = req.body;

    // Validate input
    if (!name || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and status are required' 
      });
    }

    // If accessLevelId is provided, verify it exists
    if (accessLevelId !== undefined && accessLevelId !== null) {
      const prisma = require('../prisma/client');
      const accessLevel = await prisma.accessLevel.findUnique({
        where: { id: Number(accessLevelId) }
      });
      if (!accessLevel) {
        return res.status(400).json({ 
          success: false, 
          message: 'Access level with provided ID does not exist' 
        });
      }
    }

    const role = await Role.create({
      name,
      status,
      description: description || null,
      ...(accessLevelId !== undefined && accessLevelId !== null
        ? { accessLevelId: Number(accessLevelId) }
        : {}),
    });

    return res.status(201).json({
      success: true,
      data: role,
      message: 'Role created successfully'
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create role',
      error: error.message
    });
  }
};

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    
    return res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: error.message
    });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findById(id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: `Role with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch role',
      error: error.message
    });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, description, accessLevelId } = req.body;
    
    // Check if role exists
    const existingRole = await Role.findById(id);
    
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: `Role with ID ${id} not found`
      });
    }
    
    // If accessLevelId is provided, verify it exists
    if (accessLevelId !== undefined && accessLevelId !== null) {
      const prisma = require('../prisma/client');
      const accessLevel = await prisma.accessLevel.findUnique({
        where: { id: Number(accessLevelId) }
      });
      if (!accessLevel) {
        return res.status(400).json({ 
          success: false, 
          message: 'Access level with provided ID does not exist' 
        });
      }
    }
    
    // Update role
    const updatedRole = await Role.update(id, {
      name: name !== undefined ? name : existingRole.name,
      status: status !== undefined ? status : existingRole.status,
      description: description !== undefined ? description : existingRole.description,
      accessLevelId:
        accessLevelId !== undefined
          ? accessLevelId === null
            ? null
            : Number(accessLevelId)
          : existingRole.accessLevelId,
    });
    
    return res.status(200).json({
      success: true,
      data: updatedRole,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: error.message
    });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if role exists
    const role = await Role.findById(id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: `Role with ID ${id} not found`
      });
    }
    
    // Delete role
    await Role.delete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: error.message
    });
  }
};

