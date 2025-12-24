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

// Get maintenance by category (for bar chart)
exports.getMaintenanceByCategory = async (req, res) => {
  try {
    // Get all log maintenances with their asset categories
    const logMaintenances = await prisma.logMaintenance.findMany({
      include: {
        newAsset: {
          include: {
            assetCategory: true
          }
        }
      }
    });

    // Group by category and count
    const categoryCounts = {};
    
    logMaintenances.forEach(log => {
      const categoryName = log.newAsset.assetCategory.name;
      if (!categoryCounts[categoryName]) {
        categoryCounts[categoryName] = 0;
      }
      categoryCounts[categoryName]++;
    });

    // Convert to array format for chart
    const chartData = Object.keys(categoryCounts).map(categoryName => ({
      category: categoryName,
      count: categoryCounts[categoryName]
    }));

    // Sort by count descending
    chartData.sort((a, b) => b.count - a.count);

    // Normalize values to 0-1 range for chart (optional, if frontend needs it)
    const maxCount = Math.max(...chartData.map(item => item.count), 1);
    const normalizedData = chartData.map(item => ({
      ...item,
      normalizedValue: item.count / maxCount
    }));

    return res.status(200).json({
      success: true,
      data: {
        chartData: normalizedData,
        rawData: chartData
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance by category:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get most repaired asset this month
exports.getMostRepairedAsset = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get all log maintenances from this month with asset details
    const logMaintenances = await prisma.logMaintenance.findMany({
      where: {
        startDate: {
          gte: startOfMonth,
          lte: now
        }
      },
      include: {
        newAsset: {
          include: {
            assetCategory: true
          }
        }
      }
    });

    // Group by asset and count repairs
    const assetRepairCounts = {};
    
    logMaintenances.forEach(log => {
      const assetId = log.newAsset.id;
      const assetName = log.newAsset.name;
      
      if (!assetRepairCounts[assetId]) {
        assetRepairCounts[assetId] = {
          id: assetId,
          name: assetName,
          serialNo: log.newAsset.serialNo,
          category: log.newAsset.assetCategory.name,
          repairCount: 0
        };
      }
      assetRepairCounts[assetId].repairCount++;
    });

    // Convert to array and find the most repaired
    const assetArray = Object.values(assetRepairCounts);
    
    if (assetArray.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          asset: null,
          repairCount: 0,
          message: 'No repairs recorded this month'
        }
      });
    }

    // Sort by repair count descending and get the top one
    assetArray.sort((a, b) => b.repairCount - a.repairCount);
    const mostRepaired = assetArray[0];

    return res.status(200).json({
      success: true,
      data: {
        asset: {
          id: mostRepaired.id,
          name: mostRepaired.name,
          serialNo: mostRepaired.serialNo,
          category: mostRepaired.category
        },
        repairCount: mostRepaired.repairCount,
        period: 'this month'
      }
    });
  } catch (error) {
    console.error('Error fetching most repaired asset:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get recent maintenance logs
exports.getRecentMaintenance = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5; // Default to 5 recent items
    
    // Get recent log maintenances ordered by startDate descending
    const logMaintenances = await prisma.logMaintenance.findMany({
      take: limit,
      orderBy: { startDate: 'desc' },
      include: {
        newAsset: {
          include: {
            assetCategory: true
          }
        },
        technician: true
      }
    });

    // Format the data for the frontend
    const recentMaintenance = logMaintenances.map(log => {
      const now = new Date();
      let status = 'Scheduled';
      
      // Determine status based on dates
      if (!log.endDate) {
        // No end date means it's pending
        if (log.startDate > now) {
          status = 'Scheduled';
        } else {
          status = 'Pending';
        }
      } else {
        const endDate = new Date(log.endDate);
        if (endDate < now) {
          status = 'Completed';
        } else if (log.startDate <= now && endDate >= now) {
          status = 'In Progress';
        } else {
          status = 'Scheduled';
        }
      }

      // Format date
      const date = new Date(log.startDate);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return {
        id: log.id,
        assetName: log.newAsset.name,
        assetId: log.newAsset.id,
        serialNo: log.newAsset.serialNo,
        category: log.newAsset.assetCategory.name,
        status: status,
        date: formattedDate,
        startDate: log.startDate,
        endDate: log.endDate,
        priorityLevel: log.priorityLevel,
        technician: log.technician ? {
          id: log.technician.id,
          name: log.technician.name_en
        } : null
      };
    });

    return res.status(200).json({
      success: true,
      data: recentMaintenance,
      count: recentMaintenance.length
    });
  } catch (error) {
    console.error('Error fetching recent maintenance:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get average downtime (mean repair duration)
exports.getAvgDowntime = async (req, res) => {
  try {
    // Get all completed maintenances (those with endDate)
    const completedMaintenances = await prisma.logMaintenance.findMany({
      where: {
        endDate: {
          not: null
        }
      },
      select: {
        startDate: true,
        endDate: true
      }
    });

    if (completedMaintenances.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          avgDowntimeDays: 0,
          avgDowntimeHours: 0,
          formattedValue: '0 days',
          totalRepairs: 0,
          message: 'No completed repairs to calculate average downtime'
        }
      });
    }

    // Calculate downtime for each completed maintenance
    const downtimes = completedMaintenances.map(log => {
      const start = new Date(log.startDate);
      const end = new Date(log.endDate);
      const diffMs = end - start;
      return diffMs; // Difference in milliseconds
    });

    // Calculate average downtime in milliseconds
    const totalDowntimeMs = downtimes.reduce((sum, downtime) => sum + downtime, 0);
    const avgDowntimeMs = totalDowntimeMs / downtimes.length;

    // Convert to days
    const avgDowntimeDays = avgDowntimeMs / (1000 * 60 * 60 * 24);
    const avgDowntimeHours = avgDowntimeMs / (1000 * 60 * 60);

    // Format the value
    let formattedValue;
    if (avgDowntimeDays < 1) {
      formattedValue = `${avgDowntimeHours.toFixed(1)} hours`;
    } else {
      formattedValue = `${avgDowntimeDays.toFixed(1)} days`;
    }

    // Additional statistics
    const minDowntimeDays = Math.min(...downtimes.map(d => d / (1000 * 60 * 60 * 24)));
    const maxDowntimeDays = Math.max(...downtimes.map(d => d / (1000 * 60 * 60 * 24)));

    return res.status(200).json({
      success: true,
      data: {
        avgDowntimeDays: parseFloat(avgDowntimeDays.toFixed(2)),
        avgDowntimeHours: parseFloat(avgDowntimeHours.toFixed(2)),
        formattedValue: formattedValue,
        totalRepairs: completedMaintenances.length,
        minDowntimeDays: parseFloat(minDowntimeDays.toFixed(2)),
        maxDowntimeDays: parseFloat(maxDowntimeDays.toFixed(2)),
        label: 'Mean repair duration'
      }
    });
  } catch (error) {
    console.error('Error calculating average downtime:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

