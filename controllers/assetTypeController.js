const prisma = require('../prisma/client');

// Controller methods for AssetType CRUD operations
exports.createAssetType = async (req, res) => {
  try {
    const { name_en, name_ar, status } = req.body;
    
    // Validate required fields
    if (!name_en || !name_ar) {
      return res.status(400).json({ 
        error: 'Required fields missing: name_en and name_ar are required' 
      });
    }
    
    // Create new asset type
    const assetType = await prisma.assetType.create({
      data: {
        name_en,
        name_ar,
        status: status !== undefined ? parseInt(status) : 1
      }
    });
    
    res.status(201).json({ 
      message: 'Asset type created successfully',
      assetType
    });
  } catch (error) {
    console.error('Error creating asset type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllAssetTypes = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
    const skip = (page - 1) * limit;
    const status = req.query.status;
    
    // Build filter object
    const where = {};
    if (status !== undefined) where.status = parseInt(status);
    
    // Get asset types with pagination, sort by createdAt descending (newest first)
    const assetTypes = await prisma.assetType.findMany({
      where,
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    // Get total count
    const totalItems = await prisma.assetType.count({ where });
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
      assetTypes
    });
  } catch (error) {
    console.error('Error retrieving asset types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAssetTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find asset type by ID
    const assetType = await prisma.assetType.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!assetType) {
      return res.status(404).json({ message: 'Asset type not found' });
    }
    
    res.status(200).json(assetType);
  } catch (error) {
    console.error('Error retrieving asset type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateAssetType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_en, name_ar, status } = req.body;
    
    // Check if asset type exists
    const existingAssetType = await prisma.assetType.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingAssetType) {
      return res.status(404).json({ message: 'Asset type not found' });
    }
    
    // Update asset type
    const updatedAssetType = await prisma.assetType.update({
      where: { id: parseInt(id) },
      data: {
        name_en: name_en !== undefined ? name_en : existingAssetType.name_en,
        name_ar: name_ar !== undefined ? name_ar : existingAssetType.name_ar,
        status: status !== undefined ? parseInt(status) : existingAssetType.status
      }
    });
    
    res.status(200).json({
      message: 'Asset type updated successfully',
      assetType: updatedAssetType
    });
  } catch (error) {
    console.error('Error updating asset type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteAssetType = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if asset type exists
    const existingAssetType = await prisma.assetType.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingAssetType) {
      return res.status(404).json({ message: 'Asset type not found' });
    }
    
    // Delete asset type
    await prisma.assetType.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Asset type deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
