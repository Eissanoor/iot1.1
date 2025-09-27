const prisma = require('../prisma/client');

// Controller methods for TransferAsset CRUD operations
exports.createTransferAsset = async (req, res) => {
  try {
    const { 
      iotDeviceAssetId,
      employeeId,
      location,
      note
    } = req.body;
    
    // Validate required fields
    if (!iotDeviceAssetId || !employeeId || !location) {
      return res.status(400).json({ 
        error: 'Required fields missing: iotDeviceAssetId, employeeId, and location are required' 
      });
    }
    
    // Check if IoT device asset exists
    const iotDeviceAsset = await prisma.iotDeviceAsset.findUnique({
      where: { id: parseInt(iotDeviceAssetId) }
    });
    
    if (!iotDeviceAsset) {
      return res.status(404).json({ error: 'IoT Device Asset not found' });
    }
    
    // Check if employee exists
    const employee = await prisma.employeeList.findUnique({
      where: { id: parseInt(employeeId) }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Create new transfer asset
    const transferAsset = await prisma.transferAsset.create({
      data: {
        iotDeviceAssetId: parseInt(iotDeviceAssetId),
        employeeId: parseInt(employeeId),
        location,
        note: note || null
      },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        employee: true
      }
    });
    
    res.status(201).json({ 
      message: 'Transfer Asset created successfully',
      transferAsset
    });
  } catch (error) {
    console.error('Error creating transfer asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllTransferAssets = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
    const skip = (page - 1) * limit;
    const iotDeviceAssetId = req.query.iotDeviceAssetId ? parseInt(req.query.iotDeviceAssetId) : undefined;
    const employeeId = req.query.employeeId ? parseInt(req.query.employeeId) : undefined;
    const location = req.query.location;
    
    // Build filter object
    const where = {};
    if (iotDeviceAssetId) where.iotDeviceAssetId = iotDeviceAssetId;
    if (employeeId) where.employeeId = employeeId;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    
    // Get transfer assets with pagination, sort by createdAt descending (newest first)
    const transferAssets = await prisma.transferAsset.findMany({
      where,
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        employee: true
      }
    });
    
    // Get total count
    const totalItems = await prisma.transferAsset.count({ where });
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
      transferAssets
    });
  } catch (error) {
    console.error('Error retrieving transfer assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTransferAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find transfer asset by ID
    const transferAsset = await prisma.transferAsset.findUnique({
      where: { id: parseInt(id) },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        employee: true
      }
    });
    
    if (!transferAsset) {
      return res.status(404).json({ message: 'Transfer Asset not found' });
    }
    
    res.status(200).json(transferAsset);
  } catch (error) {
    console.error('Error retrieving transfer asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTransferAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      iotDeviceAssetId,
      employeeId,
      location,
      note
    } = req.body;
    
    // Check if transfer asset exists
    const existingTransferAsset = await prisma.transferAsset.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingTransferAsset) {
      return res.status(404).json({ message: 'Transfer Asset not found' });
    }
    
    // Check if IoT device asset exists if iotDeviceAssetId is provided
    if (iotDeviceAssetId) {
      const iotDeviceAsset = await prisma.iotDeviceAsset.findUnique({
        where: { id: parseInt(iotDeviceAssetId) }
      });
      
      if (!iotDeviceAsset) {
        return res.status(404).json({ error: 'IoT Device Asset not found' });
      }
    }
    
    // Check if employee exists if employeeId is provided
    if (employeeId) {
      const employee = await prisma.employeeList.findUnique({
        where: { id: parseInt(employeeId) }
      });
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
    }
    
    // Update transfer asset
    const updatedTransferAsset = await prisma.transferAsset.update({
      where: { id: parseInt(id) },
      data: {
        iotDeviceAssetId: iotDeviceAssetId !== undefined ? parseInt(iotDeviceAssetId) : existingTransferAsset.iotDeviceAssetId,
        employeeId: employeeId !== undefined ? parseInt(employeeId) : existingTransferAsset.employeeId,
        location: location !== undefined ? location : existingTransferAsset.location,
        note: note !== undefined ? note : existingTransferAsset.note
      },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        employee: true
      }
    });
    
    res.status(200).json({
      message: 'Transfer Asset updated successfully',
      transferAsset: updatedTransferAsset
    });
  } catch (error) {
    console.error('Error updating transfer asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteTransferAsset = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if transfer asset exists
    const existingTransferAsset = await prisma.transferAsset.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingTransferAsset) {
      return res.status(404).json({ message: 'Transfer Asset not found' });
    }
    
    // Delete transfer asset
    await prisma.transferAsset.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Transfer Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting transfer asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get transfer assets by IoT device asset ID
exports.getTransferAssetsByIotDeviceAssetId = async (req, res) => {
  try {
    const { iotDeviceAssetId } = req.params;
    
    // Validate IoT device asset exists
    const iotDeviceAsset = await prisma.iotDeviceAsset.findUnique({
      where: { id: parseInt(iotDeviceAssetId) }
    });
    
    if (!iotDeviceAsset) {
      return res.status(404).json({ error: 'IoT Device Asset not found' });
    }
    
    // Get transfer assets
    const transferAssets = await prisma.transferAsset.findMany({
      where: { iotDeviceAssetId: parseInt(iotDeviceAssetId) },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        employee: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({
      iotDeviceAsset,
      transferAssets
    });
  } catch (error) {
    console.error('Error retrieving transfer assets by IoT device asset ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get transfer assets by employee ID
exports.getTransferAssetsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Validate employee exists
    const employee = await prisma.employeeList.findUnique({
      where: { id: parseInt(employeeId) }
    });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Get transfer assets
    const transferAssets = await prisma.transferAsset.findMany({
      where: { employeeId: parseInt(employeeId) },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        employee: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({
      employee,
      transferAssets
    });
  } catch (error) {
    console.error('Error retrieving transfer assets by employee ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get transfer history for an IoT device asset
exports.getTransferHistory = async (req, res) => {
  try {
    const { iotDeviceAssetId } = req.params;
    
    // Validate IoT device asset exists
    const iotDeviceAsset = await prisma.iotDeviceAsset.findUnique({
      where: { id: parseInt(iotDeviceAssetId) },
      include: {
        iotDevice: true,
        assetTypeRef: true
      }
    });
    
    if (!iotDeviceAsset) {
      return res.status(404).json({ error: 'IoT Device Asset not found' });
    }
    
    // Get all transfer history for this asset
    const transferHistory = await prisma.transferAsset.findMany({
      where: { iotDeviceAssetId: parseInt(iotDeviceAssetId) },
      include: {
        employee: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({
      iotDeviceAsset,
      transferHistory,
      totalTransfers: transferHistory.length
    });
  } catch (error) {
    console.error('Error retrieving transfer history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
