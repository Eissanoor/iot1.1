const prisma = require('../prisma/client');
const { upload, getImageUrl } = require('../utils/uploadUtils');

// Middleware for handling file uploads
exports.uploadAssetImage = upload.single('image');

// Controller methods for Asset CRUD operations
exports.createAsset = async (req, res) => {
  try {
    const { 
      name, 
      tagNumber, 
      model, 
      brand, 
      serialNumber, 
      assetCondition, 
      assetStatus, 
      description, 
      assetDescription, 
      categoryId, 
      subCategoryId, 
      locationId, 
      locationCode,
      price,
      modifiers,
      manufactureDate,
      expiryDate
    } = req.body;
    
    // Validate required fields
    if (!name || !tagNumber || !model || !categoryId || !subCategoryId || !locationId) {
      return res.status(400).json({ 
        error: 'Required fields missing: name, tagNumber, model, categoryId, subCategoryId, and locationId are required' 
      });
    }
    
    // Check if location exists
    const location = await prisma.location.findUnique({
      where: { id: parseInt(locationId) }
    });
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if subcategory exists and belongs to the specified category
    const subCategory = await prisma.subCategory.findFirst({
      where: { 
        id: parseInt(subCategoryId),
        categoryId: parseInt(categoryId)
      }
    });
    
    if (!subCategory) {
      return res.status(404).json({ error: 'SubCategory not found or does not belong to the specified category' });
    }
    
    // Process image if uploaded
    let imagePath = null;
    if (req.file) {
      imagePath = getImageUrl(req.file.filename);
    }
    
    // Parse dates if provided
    const parsedManufactureDate = manufactureDate ? new Date(manufactureDate) : null;
    const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null;
    
    // Create new asset
    const asset = await prisma.asset.create({
      data: {
        name,
        tagNumber,
        model,
        brand: brand || '',
        serialNumber: serialNumber || null,
        assetCondition: assetCondition || 'Good',
        assetStatus: assetStatus || 'In Use',
        description: description || '',
        assetDescription: assetDescription || null,
        image: imagePath,
        price: price ? parseFloat(price) : null,
        modifiers: modifiers || null,
        manufactureDate: parsedManufactureDate,
        expiryDate: parsedExpiryDate,
        categoryId: parseInt(categoryId),
        subCategoryId: parseInt(subCategoryId),
        locationId: parseInt(locationId),
        locationCode: locationCode || location.locationCode
      }
    });
    
    res.status(201).json({ 
      message: 'Asset created successfully',
      asset
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Tag number already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllAssets = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
    const skip = (page - 1) * limit;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : undefined;
    const subCategoryId = req.query.subCategoryId ? parseInt(req.query.subCategoryId) : undefined;
    const locationId = req.query.locationId ? parseInt(req.query.locationId) : undefined;
    const status = req.query.status;
    const condition = req.query.condition;
    
    // Build filter object
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (locationId) where.locationId = locationId;
    if (status) where.assetStatus = status;
    if (condition) where.assetCondition = condition;
    
    // Get assets with pagination, sort by createdAt descending (newest first)
    const assets = await prisma.asset.findMany({
      where,
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        subCategory: true,
        location: true
      }
    });
    
    // Get total count
    const totalItems = await prisma.asset.count({ where });
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
      assets
    });
  } catch (error) {
    console.error('Error retrieving assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find asset by ID
    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        subCategory: true,
        location: true
      }
    });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.status(200).json(asset);
  } catch (error) {
    console.error('Error retrieving asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      tagNumber, 
      model, 
      brand, 
      serialNumber, 
      assetCondition, 
      assetStatus, 
      description, 
      assetDescription, 
      categoryId, 
      subCategoryId, 
      locationId, 
      locationCode,
      price,
      modifiers,
      manufactureDate,
      expiryDate
    } = req.body;
    
    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Process image if uploaded
    let imagePath = existingAsset.image;
    if (req.file) {
      imagePath = getImageUrl(req.file.filename);
    }
    
    // Check if location exists if locationId is provided
    if (locationId) {
      const location = await prisma.location.findUnique({
        where: { id: parseInt(locationId) }
      });
      
      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }
    }
    
    // Check if category exists if categoryId is provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }
    
    // Check if subcategory exists if subCategoryId is provided
    if (subCategoryId && categoryId) {
      const subCategory = await prisma.subCategory.findFirst({
        where: { 
          id: parseInt(subCategoryId),
          categoryId: parseInt(categoryId)
        }
      });
      
      if (!subCategory) {
        return res.status(404).json({ error: 'SubCategory not found or does not belong to the specified category' });
      }
    } else if (subCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({
        where: { id: parseInt(subCategoryId) }
      });
      
      if (!subCategory) {
        return res.status(404).json({ error: 'SubCategory not found' });
      }
    }
    
    // Parse dates if provided
    const parsedManufactureDate = manufactureDate ? new Date(manufactureDate) : undefined;
    const parsedExpiryDate = expiryDate ? new Date(expiryDate) : undefined;
    
    // Update asset
    const updatedAsset = await prisma.asset.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : existingAsset.name,
        tagNumber: tagNumber !== undefined ? tagNumber : existingAsset.tagNumber,
        model: model !== undefined ? model : existingAsset.model,
        brand: brand !== undefined ? brand : existingAsset.brand,
        serialNumber: serialNumber !== undefined ? serialNumber : existingAsset.serialNumber,
        assetCondition: assetCondition !== undefined ? assetCondition : existingAsset.assetCondition,
        assetStatus: assetStatus !== undefined ? assetStatus : existingAsset.assetStatus,
        description: description !== undefined ? description : existingAsset.description,
        assetDescription: assetDescription !== undefined ? assetDescription : existingAsset.assetDescription,
        image: imagePath,
        price: price !== undefined ? parseFloat(price) : existingAsset.price,
        modifiers: modifiers !== undefined ? modifiers : existingAsset.modifiers,
        manufactureDate: parsedManufactureDate !== undefined ? parsedManufactureDate : existingAsset.manufactureDate,
        expiryDate: parsedExpiryDate !== undefined ? parsedExpiryDate : existingAsset.expiryDate,
        categoryId: categoryId !== undefined ? parseInt(categoryId) : existingAsset.categoryId,
        subCategoryId: subCategoryId !== undefined ? parseInt(subCategoryId) : existingAsset.subCategoryId,
        locationId: locationId !== undefined ? parseInt(locationId) : existingAsset.locationId,
        locationCode: locationCode !== undefined ? locationCode : existingAsset.locationCode
      }
    });
    
    res.status(200).json({
      message: 'Asset updated successfully',
      asset: updatedAsset
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Tag number already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Delete asset
    await prisma.asset.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 