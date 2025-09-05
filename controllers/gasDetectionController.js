const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to determine safety level based on gas level
const getSafetyLevel = (gasLevel) => {
  if (gasLevel <= 100) {
    return {
      level: 'Safe',
      color: 'green',
      message: 'Gas levels are within safe limits'
    };
  } else if (gasLevel <= 300) {
    return {
      level: 'Warning',
      color: 'yellow',
      message: 'Gas levels are elevated - caution advised'
    };
  } else {
    return {
      level: 'Danger',
      color: 'red',
      message: 'Gas levels are dangerous - immediate action required'
    };
  }
};

// Create new gas detection record
const createGasDetection = async (req, res) => {
  try {
    const { status } = req.body;

    if (status === undefined || status === null) {
      return res.status(400).json({
        success: false,
        message: 'Gas level (status) is required'
      });
    }

    const gasDetection = await prisma.gasDetection.create({
      data: {
        status: parseFloat(status)
      }
    });

    const safetyInfo = getSafetyLevel(gasDetection.status);

    res.status(201).json({
      success: true,
      message: 'Gas detection record created successfully',
      data: {
        ...gasDetection,
        safetyLevel: safetyInfo
      }
    });
  } catch (error) {
    console.error('Error creating gas detection record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all gas detection records
const getAllGasDetections = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const gasDetections = await prisma.gasDetection.findMany({
      skip,
      take: parseInt(limit),
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    const total = await prisma.gasDetection.count();

    // Add safety level to each record
    const gasDetectionsWithSafety = gasDetections.map(detection => ({
      ...detection,
      safetyLevel: getSafetyLevel(detection.status)
    }));

    res.status(200).json({
      success: true,
      message: 'Gas detection records retrieved successfully',
      data: gasDetectionsWithSafety,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching gas detection records:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get gas detection record by ID
const getGasDetectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const gasDetection = await prisma.gasDetection.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!gasDetection) {
      return res.status(404).json({
        success: false,
        message: 'Gas detection record not found'
      });
    }

    const safetyInfo = getSafetyLevel(gasDetection.status);

    res.status(200).json({
      success: true,
      message: 'Gas detection record retrieved successfully',
      data: {
        ...gasDetection,
        safetyLevel: safetyInfo
      }
    });
  } catch (error) {
    console.error('Error fetching gas detection record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get current/latest gas detection record
const getCurrentGasLevel = async (req, res) => {
  try {
    const latestGasDetection = await prisma.gasDetection.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!latestGasDetection) {
      return res.status(404).json({
        success: false,
        message: 'No gas detection records found'
      });
    }

    const safetyInfo = getSafetyLevel(latestGasDetection.status);

    res.status(200).json({
      success: true,
      message: 'Current gas level retrieved successfully',
      data: {
        ...latestGasDetection,
        safetyLevel: safetyInfo,
        gasType: 'Methane (CH4)', // Based on the image
        unit: 'ppm'
      }
    });
  } catch (error) {
    console.error('Error fetching current gas level:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update gas detection record
const updateGasDetection = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined || status === null) {
      return res.status(400).json({
        success: false,
        message: 'Gas level (status) is required'
      });
    }

    const existingRecord = await prisma.gasDetection.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Gas detection record not found'
      });
    }

    const updatedGasDetection = await prisma.gasDetection.update({
      where: {
        id: parseInt(id)
      },
      data: {
        status: parseFloat(status)
      }
    });

    const safetyInfo = getSafetyLevel(updatedGasDetection.status);

    res.status(200).json({
      success: true,
      message: 'Gas detection record updated successfully',
      data: {
        ...updatedGasDetection,
        safetyLevel: safetyInfo
      }
    });
  } catch (error) {
    console.error('Error updating gas detection record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete gas detection record
const deleteGasDetection = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRecord = await prisma.gasDetection.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Gas detection record not found'
      });
    }

    await prisma.gasDetection.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Gas detection record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gas detection record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get gas level history with time range filtering
const getGasLevelHistory = async (req, res) => {
  try {
    const { 
      timeRange = '24hours', 
      startDate, 
      endDate,
      page = 1,
      limit = 100
    } = req.query;

    let whereClause = {};

    // Handle time range filtering
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else {
      const now = new Date();
      let startTime;

      switch (timeRange) {
        case '1hour':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24hours':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7days':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      whereClause.createdAt = {
        gte: startTime
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gasHistory = await prisma.gasDetection.findMany({
      where: whereClause,
      skip,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'asc'
      }
    });

    const total = await prisma.gasDetection.count({ where: whereClause });

    // Add safety level and format for chart display
    const historyWithSafety = gasHistory.map(detection => ({
      ...detection,
      safetyLevel: getSafetyLevel(detection.status),
      timestamp: detection.createdAt.toISOString()
    }));

    // Calculate statistics
    const gasLevels = gasHistory.map(h => h.status);
    const stats = {
      average: gasLevels.length > 0 ? (gasLevels.reduce((a, b) => a + b, 0) / gasLevels.length).toFixed(2) : 0,
      minimum: gasLevels.length > 0 ? Math.min(...gasLevels) : 0,
      maximum: gasLevels.length > 0 ? Math.max(...gasLevels) : 0,
      totalReadings: gasLevels.length
    };

    res.status(200).json({
      success: true,
      message: 'Gas level history retrieved successfully',
      data: historyWithSafety,
      statistics: stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching gas level history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get safety status summary
const getSafetyStatusSummary = async (req, res) => {
  try {
    const { timeRange = '24hours' } = req.query;

    const now = new Date();
    let startTime;

    switch (timeRange) {
      case '1hour':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24hours':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7days':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const gasReadings = await prisma.gasDetection.findMany({
      where: {
        createdAt: {
          gte: startTime
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Categorize readings by safety level
    const safeCount = gasReadings.filter(r => r.status <= 100).length;
    const warningCount = gasReadings.filter(r => r.status > 100 && r.status <= 300).length;
    const dangerCount = gasReadings.filter(r => r.status > 300).length;

    const currentLevel = gasReadings.length > 0 ? gasReadings[0] : null;
    const currentSafety = currentLevel ? getSafetyLevel(currentLevel.status) : null;

    res.status(200).json({
      success: true,
      message: 'Safety status summary retrieved successfully',
      data: {
        currentLevel: currentLevel ? {
          ...currentLevel,
          safetyLevel: currentSafety
        } : null,
        summary: {
          timeRange,
          totalReadings: gasReadings.length,
          safeReadings: safeCount,
          warningReadings: warningCount,
          dangerReadings: dangerCount,
          safePercentage: gasReadings.length > 0 ? ((safeCount / gasReadings.length) * 100).toFixed(1) : 0,
          warningPercentage: gasReadings.length > 0 ? ((warningCount / gasReadings.length) * 100).toFixed(1) : 0,
          dangerPercentage: gasReadings.length > 0 ? ((dangerCount / gasReadings.length) * 100).toFixed(1) : 0
        },
        thresholds: {
          safe: { min: 0, max: 100, unit: 'ppm' },
          warning: { min: 101, max: 300, unit: 'ppm' },
          danger: { min: 301, max: null, unit: 'ppm' }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching safety status summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createGasDetection,
  getAllGasDetections,
  getGasDetectionById,
  getCurrentGasLevel,
  updateGasDetection,
  deleteGasDetection,
  getGasLevelHistory,
  getSafetyStatusSummary
};
