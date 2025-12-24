const prisma = require('../prisma/client');

// Controller methods for Maintenance CRUD operations
exports.createMaintenance = async (req, res) => {
  try {
    const { 
      iotDeviceAssetId,
      maintenanceType,
      scheduleDate,
      technicianId,
      note
    } = req.body;
    
    // Validate required fields
    if (!iotDeviceAssetId || !maintenanceType || !scheduleDate || !technicianId) {
      return res.status(400).json({ 
        error: 'Required fields missing: iotDeviceAssetId, maintenanceType, scheduleDate, and technicianId are required' 
      });
    }
    
    // Check if IoT device asset exists
    const iotDeviceAsset = await prisma.iotDeviceAsset.findUnique({
      where: { id: parseInt(iotDeviceAssetId) }
    });
    
    if (!iotDeviceAsset) {
      return res.status(404).json({ error: 'IoT Device Asset not found' });
    }
    
    // Check if technician exists
    const technician = await prisma.technician.findUnique({
      where: { id: parseInt(technicianId) }
    });
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Parse and validate schedule date
    const parsedScheduleDate = new Date(scheduleDate);
    if (isNaN(parsedScheduleDate.getTime())) {
      return res.status(400).json({ error: 'Invalid schedule date format' });
    }
    
    // Get user ID from JWT token or request body
    let userId;
    if (req.user && req.user.userId) {
      userId = req.user.userId;
    } else if (req.user && req.user.id) {
      userId = req.user.id;
    } else if (req.body.userId) {
      userId = req.body.userId;
    } else {
      return res.status(400).json({ 
        error: 'User ID is required. Please provide authentication token or userId in request body' 
      });
    }
    
    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create new maintenance record
    const maintenance = await prisma.maintenance.create({
      data: {
        iotDeviceAssetId: parseInt(iotDeviceAssetId),
        maintenanceType,
        scheduleDate: parsedScheduleDate,
        technicianId: parseInt(technicianId),
        note: note || null,
        userId: userId
      },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        technician: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json({ 
      message: 'Maintenance record created successfully',
      maintenance
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllMaintenances = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
    const skip = (page - 1) * limit;
    const iotDeviceAssetId = req.query.iotDeviceAssetId ? parseInt(req.query.iotDeviceAssetId) : undefined;
    const technicianId = req.query.technicianId ? parseInt(req.query.technicianId) : undefined;
    const maintenanceType = req.query.maintenanceType;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    
    // Build filter object
    const where = {};
    if (iotDeviceAssetId) where.iotDeviceAssetId = iotDeviceAssetId;
    if (technicianId) where.technicianId = technicianId;
    if (maintenanceType) where.maintenanceType = { contains: maintenanceType, mode: 'insensitive' };
    
    // Date range filtering
    if (startDate || endDate) {
      where.scheduleDate = {};
      if (startDate) where.scheduleDate.gte = new Date(startDate);
      if (endDate) where.scheduleDate.lte = new Date(endDate);
    }
    
    // Get maintenance records with pagination, sort by scheduleDate ascending (upcoming first)
    const maintenances = await prisma.maintenance.findMany({
      where,
      skip: skip,
      take: limit,
      orderBy: { scheduleDate: 'asc' },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        technician: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    // Get total count
    const totalItems = await prisma.maintenance.count({ where });
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
      maintenances
    });
  } catch (error) {
    console.error('Error retrieving maintenance records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find maintenance record by ID
    const maintenance = await prisma.maintenance.findUnique({
      where: { id: parseInt(id) },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        technician: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    res.status(200).json(maintenance);
  } catch (error) {
    console.error('Error retrieving maintenance record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      iotDeviceAssetId,
      maintenanceType,
      scheduleDate,
      technicianId,
      note
    } = req.body;
    
    // Check if maintenance record exists
    const existingMaintenance = await prisma.maintenance.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingMaintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
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
    
    // Check if technician exists if technicianId is provided
    if (technicianId) {
      const technician = await prisma.technician.findUnique({
        where: { id: parseInt(technicianId) }
      });
      
      if (!technician) {
        return res.status(404).json({ error: 'Technician not found' });
      }
    }
    
    // Parse schedule date if provided
    let parsedScheduleDate;
    if (scheduleDate) {
      parsedScheduleDate = new Date(scheduleDate);
      if (isNaN(parsedScheduleDate.getTime())) {
        return res.status(400).json({ error: 'Invalid schedule date format' });
      }
    }
    
    // Update maintenance record
    const updatedMaintenance = await prisma.maintenance.update({
      where: { id: parseInt(id) },
      data: {
        iotDeviceAssetId: iotDeviceAssetId !== undefined ? parseInt(iotDeviceAssetId) : existingMaintenance.iotDeviceAssetId,
        maintenanceType: maintenanceType !== undefined ? maintenanceType : existingMaintenance.maintenanceType,
        scheduleDate: parsedScheduleDate !== undefined ? parsedScheduleDate : existingMaintenance.scheduleDate,
        technicianId: technicianId !== undefined ? parseInt(technicianId) : existingMaintenance.technicianId,
        note: note !== undefined ? note : existingMaintenance.note
      },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        technician: true
      }
    });
    
    res.status(200).json({
      message: 'Maintenance record updated successfully',
      maintenance: updatedMaintenance
    });
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if maintenance record exists
    const existingMaintenance = await prisma.maintenance.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingMaintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    
    // Delete maintenance record
    await prisma.maintenance.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get maintenance records by IoT device asset ID
exports.getMaintenancesByIotDeviceAssetId = async (req, res) => {
  try {
    const { iotDeviceAssetId } = req.params;
    
    // Validate IoT device asset exists
    const iotDeviceAsset = await prisma.iotDeviceAsset.findUnique({
      where: { id: parseInt(iotDeviceAssetId) }
    });
    
    if (!iotDeviceAsset) {
      return res.status(404).json({ error: 'IoT Device Asset not found' });
    }
    
    // Get maintenance records
    const maintenances = await prisma.maintenance.findMany({
      where: { iotDeviceAssetId: parseInt(iotDeviceAssetId) },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        technician: true
      },
      orderBy: { scheduleDate: 'asc' }
    });
    
    res.status(200).json({
      iotDeviceAsset,
      maintenances
    });
  } catch (error) {
    console.error('Error retrieving maintenance records by IoT device asset ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get maintenance records by technician ID
exports.getMaintenancesByTechnicianId = async (req, res) => {
  try {
    const { technicianId } = req.params;
    
    // Validate technician exists
    const technician = await prisma.technician.findUnique({
      where: { id: parseInt(technicianId) }
    });
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    
    // Get maintenance records
    const maintenances = await prisma.maintenance.findMany({
      where: { technicianId: parseInt(technicianId) },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        technician: true
      },
      orderBy: { scheduleDate: 'asc' }
    });
    
    res.status(200).json({
      technician,
      maintenances
    });
  } catch (error) {
    console.error('Error retrieving maintenance records by technician ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get upcoming maintenance records
exports.getUpcomingMaintenances = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7; // Default to next 7 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);
    
    const maintenances = await prisma.maintenance.findMany({
      where: {
        scheduleDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        technician: true
      },
      orderBy: { scheduleDate: 'asc' }
    });
    
    res.status(200).json({
      maintenances,
      totalCount: maintenances.length,
      dateRange: {
        startDate,
        endDate,
        days
      }
    });
  } catch (error) {
    console.error('Error retrieving upcoming maintenance records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get maintenance records by type
exports.getMaintenancesByType = async (req, res) => {
  try {
    const { maintenanceType } = req.params;
    
    const maintenances = await prisma.maintenance.findMany({
      where: {
        maintenanceType: {
          contains: maintenanceType,
          mode: 'insensitive'
        }
      },
      include: {
        iotDeviceAsset: {
          include: {
            iotDevice: true,
            assetTypeRef: true
          }
        },
        technician: true
      },
      orderBy: { scheduleDate: 'asc' }
    });
    
    res.status(200).json({
      maintenanceType,
      maintenances,
      totalCount: maintenances.length
    });
  } catch (error) {
    console.error('Error retrieving maintenance records by type:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
