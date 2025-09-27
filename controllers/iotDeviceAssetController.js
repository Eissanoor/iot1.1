const prisma = require('../prisma/client');

// Controller methods for IotDeviceAsset CRUD operations
exports.createIotDeviceAsset = async (req, res) => {
  try {
    const { 
      assetName,
      assetType,
      location,
      description,
      iotDeviceId,
      assetTypeId
    } = req.body;
    
    // Validate required fields
    if (!assetName || !assetType || !location || !iotDeviceId || !assetTypeId) {
      return res.status(400).json({ 
        error: 'Required fields missing: assetName, assetType, location, iotDeviceId, and assetTypeId are required' 
      });
    }
    
    // Check if IoT device exists
    const iotDevice = await prisma.iotDevice.findUnique({
      where: { id: parseInt(iotDeviceId) }
    });
    
    if (!iotDevice) {
      return res.status(404).json({ error: 'IoT Device not found' });
    }
    
    // Check if asset type exists
    const assetTypeRef = await prisma.assetType.findUnique({
      where: { id: parseInt(assetTypeId) }
    });
    
    if (!assetTypeRef) {
      return res.status(404).json({ error: 'Asset Type not found' });
    }
    
    // Create new IoT device asset
    const iotDeviceAsset = await prisma.iotDeviceAsset.create({
      data: {
        assetName,
        assetType,
        location,
        description: description || null,
        iotDeviceId: parseInt(iotDeviceId),
        assetTypeId: parseInt(assetTypeId)
      },
      include: {
        iotDevice: true,
        assetTypeRef: true
      }
    });
    
    res.status(201).json({ 
      message: 'IoT Device Asset created successfully',
      iotDeviceAsset
    });
  } catch (error) {
    console.error('Error creating IoT device asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllIotDeviceAssets = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
    const skip = (page - 1) * limit;
    const iotDeviceId = req.query.iotDeviceId ? parseInt(req.query.iotDeviceId) : undefined;
    const assetTypeId = req.query.assetTypeId ? parseInt(req.query.assetTypeId) : undefined;
    const location = req.query.location;
    
    // Build filter object
    const where = {};
    if (iotDeviceId) where.iotDeviceId = iotDeviceId;
    if (assetTypeId) where.assetTypeId = assetTypeId;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    
    // Get IoT device assets with pagination, sort by createdAt descending (newest first)
    const iotDeviceAssets = await prisma.iotDeviceAsset.findMany({
      where,
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        iotDevice: true,
        assetTypeRef: true
      }
    });
    
    // Get total count
    const totalItems = await prisma.iotDeviceAsset.count({ where });
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
      iotDeviceAssets
    });
  } catch (error) {
    console.error('Error retrieving IoT device assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getIotDeviceAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find IoT device asset by ID
    const iotDeviceAsset = await prisma.iotDeviceAsset.findUnique({
      where: { id: parseInt(id) },
      include: {
        iotDevice: true,
        assetTypeRef: true
      }
    });
    
    if (!iotDeviceAsset) {
      return res.status(404).json({ message: 'IoT Device Asset not found' });
    }
    
    res.status(200).json(iotDeviceAsset);
  } catch (error) {
    console.error('Error retrieving IoT device asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateIotDeviceAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      assetName,
      assetType,
      location,
      description,
      iotDeviceId,
      assetTypeId
    } = req.body;
    
    // Check if IoT device asset exists
    const existingIotDeviceAsset = await prisma.iotDeviceAsset.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingIotDeviceAsset) {
      return res.status(404).json({ message: 'IoT Device Asset not found' });
    }
    
    // Check if IoT device exists if iotDeviceId is provided
    if (iotDeviceId) {
      const iotDevice = await prisma.iotDevice.findUnique({
        where: { id: parseInt(iotDeviceId) }
      });
      
      if (!iotDevice) {
        return res.status(404).json({ error: 'IoT Device not found' });
      }
    }
    
    // Check if asset type exists if assetTypeId is provided
    if (assetTypeId) {
      const assetTypeRef = await prisma.assetType.findUnique({
        where: { id: parseInt(assetTypeId) }
      });
      
      if (!assetTypeRef) {
        return res.status(404).json({ error: 'Asset Type not found' });
      }
    }
    
    // Update IoT device asset
    const updatedIotDeviceAsset = await prisma.iotDeviceAsset.update({
      where: { id: parseInt(id) },
      data: {
        assetName: assetName !== undefined ? assetName : existingIotDeviceAsset.assetName,
        assetType: assetType !== undefined ? assetType : existingIotDeviceAsset.assetType,
        location: location !== undefined ? location : existingIotDeviceAsset.location,
        description: description !== undefined ? description : existingIotDeviceAsset.description,
        iotDeviceId: iotDeviceId !== undefined ? parseInt(iotDeviceId) : existingIotDeviceAsset.iotDeviceId,
        assetTypeId: assetTypeId !== undefined ? parseInt(assetTypeId) : existingIotDeviceAsset.assetTypeId
      },
      include: {
        iotDevice: true,
        assetTypeRef: true
      }
    });
    
    res.status(200).json({
      message: 'IoT Device Asset updated successfully',
      iotDeviceAsset: updatedIotDeviceAsset
    });
  } catch (error) {
    console.error('Error updating IoT device asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteIotDeviceAsset = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if IoT device asset exists
    const existingIotDeviceAsset = await prisma.iotDeviceAsset.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingIotDeviceAsset) {
      return res.status(404).json({ message: 'IoT Device Asset not found' });
    }
    
    // Delete IoT device asset
    await prisma.iotDeviceAsset.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'IoT Device Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting IoT device asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get IoT device assets by IoT device ID
exports.getIotDeviceAssetsByDeviceId = async (req, res) => {
  try {
    const { iotDeviceId } = req.params;
    
    // Validate IoT device exists
    const iotDevice = await prisma.iotDevice.findUnique({
      where: { id: parseInt(iotDeviceId) }
    });
    
    if (!iotDevice) {
      return res.status(404).json({ error: 'IoT Device not found' });
    }
    
    // Get IoT device assets
    const iotDeviceAssets = await prisma.iotDeviceAsset.findMany({
      where: { iotDeviceId: parseInt(iotDeviceId) },
      include: {
        iotDevice: true,
        assetTypeRef: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({
      iotDevice,
      iotDeviceAssets
    });
  } catch (error) {
    console.error('Error retrieving IoT device assets by device ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get IoT device assets by asset type ID
exports.getIotDeviceAssetsByAssetTypeId = async (req, res) => {
  try {
    const { assetTypeId } = req.params;
    
    // Validate asset type exists
    const assetType = await prisma.assetType.findUnique({
      where: { id: parseInt(assetTypeId) }
    });
    
    if (!assetType) {
      return res.status(404).json({ error: 'Asset Type not found' });
    }
    
    // Get IoT device assets
    const iotDeviceAssets = await prisma.iotDeviceAsset.findMany({
      where: { assetTypeId: parseInt(assetTypeId) },
      include: {
        iotDevice: true,
        assetTypeRef: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({
      assetType,
      iotDeviceAssets
    });
  } catch (error) {
    console.error('Error retrieving IoT device assets by asset type ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
