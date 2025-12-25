const prisma = require('../prisma/client');

// Controller methods for CategoryManagementType CRUD operations
exports.createCategoryManagementType = async (req, res) => {
  try {
    const { name, status } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        error: 'Required field missing: name is required' 
      });
    }
    
    // Create new category management type
    const categoryManagementType = await prisma.categoryManagementType.create({
      data: {
        name,
        status: status || 'active'
      }
    });
    
    res.status(201).json({ 
      message: 'Category management type created successfully',
      categoryManagementType
    });
  } catch (error) {
    console.error('Error creating category management type:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category management type with this name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllCategoryManagementTypes = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
    const skip = (page - 1) * limit;
    const status = req.query.status;
    
    // Build filter object
    const where = {};
    if (status !== undefined) where.status = status;
    
    // Get category management types with pagination, sort by createdAt descending (newest first)
    const categoryManagementTypes = await prisma.categoryManagementType.findMany({
      where,
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    // Get total count
    const totalItems = await prisma.categoryManagementType.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    
    res.status(200).json({
      pagination: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      categoryManagementTypes
    });
  } catch (error) {
    console.error('Error retrieving category management types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCategoryManagementTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find category management type by ID
    const categoryManagementType = await prisma.categoryManagementType.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!categoryManagementType) {
      return res.status(404).json({ message: 'Category management type not found' });
    }
    
    res.status(200).json(categoryManagementType);
  } catch (error) {
    console.error('Error retrieving category management type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCategoryManagementType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    
    // Check if category management type exists
    const existingCategoryManagementType = await prisma.categoryManagementType.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingCategoryManagementType) {
      return res.status(404).json({ message: 'Category management type not found' });
    }
    
    // Update category management type
    const updatedCategoryManagementType = await prisma.categoryManagementType.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : existingCategoryManagementType.name,
        status: status !== undefined ? status : existingCategoryManagementType.status
      }
    });
    
    res.status(200).json({
      message: 'Category management type updated successfully',
      categoryManagementType: updatedCategoryManagementType
    });
  } catch (error) {
    console.error('Error updating category management type:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category management type with this name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteCategoryManagementType = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category management type exists
    const existingCategoryManagementType = await prisma.categoryManagementType.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingCategoryManagementType) {
      return res.status(404).json({ message: 'Category management type not found' });
    }
    
    // Delete category management type
    await prisma.categoryManagementType.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Category management type deleted successfully' });
  } catch (error) {
    console.error('Error deleting category management type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

