const prisma = require('../prisma/client');

// Create a new LogMaintenance record
exports.createLogMaintenance = async (req, res) => {
  try {
    const {
      newAssetId,
      maintenanceId,
      issueDescription,
      priorityLevel,
      technicianId,
      startDate,
      endDate,
      estimatedCost,
      currentCondition,
      additionalNotes
    } = req.body;

    // Validate required fields
    if (
      !newAssetId ||
      !maintenanceId ||
      !issueDescription ||
      !priorityLevel ||
      !technicianId ||
      !startDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Required fields: newAssetId, maintenanceId, issueDescription, priorityLevel, technicianId, startDate'
      });
    }

    // Validate related entities
    const [newAsset, maintenance, technician] = await Promise.all([
      prisma.newAsset.findUnique({ where: { id: parseInt(newAssetId, 10) } }),
      prisma.maintenance.findUnique({ where: { id: parseInt(maintenanceId, 10) } }),
      prisma.technician.findUnique({ where: { id: parseInt(technicianId, 10) } })
    ]);

    if (!newAsset) {
      return res.status(404).json({
        success: false,
        message: 'NewAsset not found'
      });
    }

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Parse dates
    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate format'
      });
    }

    const parsedEndDate = endDate ? new Date(endDate) : null;
    if (endDate && isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid endDate format'
      });
    }

    const parsedEstimatedCost =
      estimatedCost !== undefined && estimatedCost !== null && estimatedCost !== ''
        ? parseFloat(estimatedCost)
        : null;

    // Create log maintenance
    const logMaintenance = await prisma.logMaintenance.create({
      data: {
        newAssetId: parseInt(newAssetId, 10),
        maintenanceId: parseInt(maintenanceId, 10),
        technicianId: parseInt(technicianId, 10),
        issueDescription,
        priorityLevel,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        estimatedCost: parsedEstimatedCost,
        currentCondition: currentCondition || null,
        additionalNotes: additionalNotes || null
      },
      include: {
        newAsset: true,
        maintenance: true,
        technician: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'LogMaintenance record created successfully',
      data: logMaintenance
    });
  } catch (error) {
    console.error('Error creating log maintenance record:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all LogMaintenance records with optional filters
exports.getAllLogMaintenances = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const newAssetId = req.query.newAssetId
      ? parseInt(req.query.newAssetId, 10)
      : undefined;
    const technicianId = req.query.technicianId
      ? parseInt(req.query.technicianId, 10)
      : undefined;
    const maintenanceId = req.query.maintenanceId
      ? parseInt(req.query.maintenanceId, 10)
      : undefined;
    const priorityLevel = req.query.priorityLevel;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const where = {};
    if (newAssetId) where.newAssetId = newAssetId;
    if (technicianId) where.technicianId = technicianId;
    if (maintenanceId) where.maintenanceId = maintenanceId;
    if (priorityLevel) {
      where.priorityLevel = {
        contains: priorityLevel,
        mode: 'insensitive'
      };
    }

    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }

    const logMaintenances = await prisma.logMaintenance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        newAsset: true,
        maintenance: true,
        technician: true
      }
    });

    const totalItems = await prisma.logMaintenance.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      pagination: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      data: logMaintenances
    });
  } catch (error) {
    console.error('Error fetching log maintenance records:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a single LogMaintenance record by ID
exports.getLogMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const logMaintenance = await prisma.logMaintenance.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        newAsset: true,
        maintenance: true,
        technician: true
      }
    });

    if (!logMaintenance) {
      return res.status(404).json({
        success: false,
        message: 'LogMaintenance record not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: logMaintenance
    });
  } catch (error) {
    console.error('Error fetching log maintenance record:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a LogMaintenance record
exports.updateLogMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      newAssetId,
      maintenanceId,
      issueDescription,
      priorityLevel,
      technicianId,
      startDate,
      endDate,
      estimatedCost,
      currentCondition,
      additionalNotes
    } = req.body;

    const existing = await prisma.logMaintenance.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'LogMaintenance record not found'
      });
    }

    // Validate related entities if IDs provided
    if (newAssetId) {
      const newAsset = await prisma.newAsset.findUnique({
        where: { id: parseInt(newAssetId, 10) }
      });
      if (!newAsset) {
        return res.status(404).json({
          success: false,
          message: 'NewAsset not found'
        });
      }
    }

    if (maintenanceId) {
      const maintenance = await prisma.maintenance.findUnique({
        where: { id: parseInt(maintenanceId, 10) }
      });
      if (!maintenance) {
        return res.status(404).json({
          success: false,
          message: 'Maintenance record not found'
        });
      }
    }

    if (technicianId) {
      const technician = await prisma.technician.findUnique({
        where: { id: parseInt(technicianId, 10) }
      });
      if (!technician) {
        return res.status(404).json({
          success: false,
          message: 'Technician not found'
        });
      }
    }

    let parsedStartDate = existing.startDate;
    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDate format'
        });
      }
    }

    let parsedEndDate = existing.endDate;
    if (endDate !== undefined) {
      if (endDate === null || endDate === '') {
        parsedEndDate = null;
      } else {
        parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid endDate format'
          });
        }
      }
    }

    const parsedEstimatedCost =
      estimatedCost !== undefined && estimatedCost !== null && estimatedCost !== ''
        ? parseFloat(estimatedCost)
        : existing.estimatedCost;

    const updated = await prisma.logMaintenance.update({
      where: { id: parseInt(id, 10) },
      data: {
        newAssetId:
          newAssetId !== undefined ? parseInt(newAssetId, 10) : existing.newAssetId,
        maintenanceId:
          maintenanceId !== undefined
            ? parseInt(maintenanceId, 10)
            : existing.maintenanceId,
        technicianId:
          technicianId !== undefined
            ? parseInt(technicianId, 10)
            : existing.technicianId,
        issueDescription:
          issueDescription !== undefined
            ? issueDescription
            : existing.issueDescription,
        priorityLevel:
          priorityLevel !== undefined ? priorityLevel : existing.priorityLevel,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        estimatedCost: parsedEstimatedCost,
        currentCondition:
          currentCondition !== undefined
            ? currentCondition
            : existing.currentCondition,
        additionalNotes:
          additionalNotes !== undefined
            ? additionalNotes
            : existing.additionalNotes
      },
      include: {
        newAsset: true,
        maintenance: true,
        technician: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'LogMaintenance record updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating log maintenance record:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a LogMaintenance record
exports.deleteLogMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.logMaintenance.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'LogMaintenance record not found'
      });
    }

    await prisma.logMaintenance.delete({
      where: { id: parseInt(id, 10) }
    });

    return res.status(200).json({
      success: true,
      message: 'LogMaintenance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting log maintenance record:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get dashboard statistics for log maintenance cards
exports.getLogMaintenanceStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Calculate date ranges
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Active Maintenance: Logs without endDate or endDate in the future
    const activeMaintenance = await prisma.logMaintenance.count({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      }
    });
    
    // Active Maintenance last week (for comparison)
    const activeMaintenanceLastWeek = await prisma.logMaintenance.count({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: lastWeek } }
        ],
        startDate: { lte: lastWeek }
      }
    });
    
    // Calculate percentage change for Active Maintenance
    const activeMaintenanceChange = activeMaintenanceLastWeek > 0
      ? Math.round(((activeMaintenance - activeMaintenanceLastWeek) / activeMaintenanceLastWeek) * 100)
      : activeMaintenance > 0 ? 100 : 0;
    
    // Completed This Month: Logs with endDate in current month
    const completedThisMonth = await prisma.logMaintenance.count({
      where: {
        endDate: {
          gte: startOfMonth,
          lte: now
        }
      }
    });
    
    // Completed Last Month (for comparison)
    const completedLastMonth = await prisma.logMaintenance.count({
      where: {
        endDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      }
    });
    
    // Calculate percentage change for Completed This Month
    const completedChange = completedLastMonth > 0
      ? Math.round(((completedThisMonth - completedLastMonth) / completedLastMonth) * 100)
      : completedThisMonth > 0 ? 100 : 0;
    
    // Pending Approval: Logs without endDate (assuming these are pending)
    const pendingApproval = await prisma.logMaintenance.count({
      where: {
        endDate: null
      }
    });
    
    // Pending Approval yesterday (for comparison)
    const pendingApprovalYesterday = await prisma.logMaintenance.count({
      where: {
        endDate: null,
        startDate: { lte: yesterday }
      }
    });
    
    // Calculate difference for Pending Approval
    const pendingDifference = pendingApproval - pendingApprovalYesterday;
    
    // Total Cost: Sum of all estimatedCost
    const totalCostResult = await prisma.logMaintenance.aggregate({
      _sum: {
        estimatedCost: true
      }
    });
    
    const totalCost = totalCostResult._sum.estimatedCost || 0;
    
    // Total Cost last month (for comparison)
    const totalCostLastMonthResult = await prisma.logMaintenance.aggregate({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      },
      _sum: {
        estimatedCost: true
      }
    });
    
    const totalCostLastMonth = totalCostLastMonthResult._sum.estimatedCost || 0;
    
    // Calculate percentage change for Total Cost (comparing with previous period)
    // For budget comparison, we'll use a simple growth calculation
    const totalCostChange = totalCostLastMonth > 0
      ? Math.round(((totalCost - totalCostLastMonth) / totalCostLastMonth) * 100)
      : totalCost > 0 ? 100 : 0;
    
    // Format response
    return res.status(200).json({
      success: true,
      data: {
        activeMaintenance: {
          value: activeMaintenance,
          label: 'Active Maintenance',
          trend: {
            direction: activeMaintenanceChange >= 0 ? 'up' : 'down',
            percentage: Math.abs(activeMaintenanceChange),
            text: `${Math.abs(activeMaintenanceChange)}% from last week`
          }
        },
        completedThisMonth: {
          value: completedThisMonth,
          label: 'Completed This Month',
          trend: {
            direction: completedChange >= 0 ? 'up' : 'down',
            percentage: Math.abs(completedChange),
            text: `${Math.abs(completedChange)}% ${completedChange >= 0 ? 'increase' : 'decrease'}`
          }
        },
        pendingApproval: {
          value: pendingApproval,
          label: 'Pending Approval',
          trend: {
            direction: pendingDifference <= 0 ? 'down' : 'up',
            difference: Math.abs(pendingDifference),
            text: pendingDifference < 0 
              ? `${Math.abs(pendingDifference)} less than yesterday`
              : pendingDifference > 0
              ? `${pendingDifference} more than yesterday`
              : 'Same as yesterday'
          }
        },
        totalCost: {
          value: totalCost.toFixed(2),
          label: 'Total Cost (SAR)',
          trend: {
            direction: totalCostChange >= 0 ? 'up' : 'down',
            percentage: Math.abs(totalCostChange),
            text: `${Math.abs(totalCostChange)}% from budget`
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching log maintenance statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


