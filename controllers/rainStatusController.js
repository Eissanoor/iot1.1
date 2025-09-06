const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to determine rain detection status and intensity
const getRainDetectionInfo = (status) => {
  if (status > 20) {
    let intensity = 'Light Rain';
    let intensityLevel = 1;
    
    if (status > 80) {
      intensity = 'Storm';
      intensityLevel = 5;
    } else if (status > 60) {
      intensity = 'Heavy Rain';
      intensityLevel = 4;
    } else if (status > 40) {
      intensity = 'Light Rain';
      intensityLevel = 3;
    } else if (status > 30) {
      intensity = 'Damp';
      intensityLevel = 2;
    }

    return {
      detected: true,
      status: 'Rain Detected',
      weatherStatus: 'Rainy',
      intensity: intensity,
      intensityLevel: intensityLevel,
      message: `${intensity} detected`,
      color: 'blue',
      icon: '🌧️'
    };
  } else {
    return {
      detected: false,
      status: 'No Rain Detected',
      weatherStatus: 'Clear',
      intensity: 'Dry',
      intensityLevel: 0,
      message: 'Clear weather conditions',
      color: 'yellow',
      icon: '☀️'
    };
  }
};

// Create new rain status record
const createRainStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (status === undefined || status === null) {
      return res.status(400).json({
        success: false,
        message: 'Rain status value is required'
      });
    }

    const rainInfo = getRainDetectionInfo(parseFloat(status));

    const rainStatus = await prisma.rainStatus.create({
      data: {
        status: parseFloat(status)
      }
    });

    res.status(201).json({
      success: true,
      message: 'Rain status record created successfully',
      data: {
        ...rainStatus,
        rainInfo: rainInfo,
        threshold: 20
      }
    });
  } catch (error) {
    console.error('Error creating rain status record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all rain status records
const getAllRainStatus = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const rainRecords = await prisma.rainStatus.findMany({
      skip,
      take: parseInt(limit),
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    const total = await prisma.rainStatus.count();

    // Add rain info to each record
    const rainRecordsWithInfo = rainRecords.map(record => ({
      ...record,
      rainInfo: getRainDetectionInfo(record.status)
    }));

    res.status(200).json({
      success: true,
      message: 'Rain status records retrieved successfully',
      data: rainRecordsWithInfo,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching rain status records:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get rain status record by ID
const getRainStatusById = async (req, res) => {
  try {
    const { id } = req.params;

    const rainStatus = await prisma.rainStatus.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!rainStatus) {
      return res.status(404).json({
        success: false,
        message: 'Rain status record not found'
      });
    }

    const rainInfo = getRainDetectionInfo(rainStatus.status);

    res.status(200).json({
      success: true,
      message: 'Rain status record retrieved successfully',
      data: {
        ...rainStatus,
        rainInfo: rainInfo,
        threshold: 20
      }
    });
  } catch (error) {
    console.error('Error fetching rain status record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get current/latest rain status
const getCurrentRainStatus = async (req, res) => {
  try {
    const latestRainStatus = await prisma.rainStatus.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!latestRainStatus) {
      return res.status(404).json({
        success: false,
        message: 'No rain status records found'
      });
    }

    const rainInfo = getRainDetectionInfo(latestRainStatus.status);

    res.status(200).json({
      success: true,
      message: 'Current rain status retrieved successfully',
      data: {
        ...latestRainStatus,
        rainInfo: rainInfo,
        sensorType: 'Rain Sensor',
        threshold: 20,
        unit: 'intensity level'
      }
    });
  } catch (error) {
    console.error('Error fetching current rain status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update rain status record
const updateRainStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined || status === null) {
      return res.status(400).json({
        success: false,
        message: 'Rain status value is required'
      });
    }

    const existingRecord = await prisma.rainStatus.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Rain status record not found'
      });
    }

    const rainInfo = getRainDetectionInfo(parseFloat(status));

    const updatedRainStatus = await prisma.rainStatus.update({
      where: {
        id: parseInt(id)
      },
      data: {
        status: parseFloat(status)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Rain status record updated successfully',
      data: {
        ...updatedRainStatus,
        rainInfo: rainInfo,
        threshold: 20
      }
    });
  } catch (error) {
    console.error('Error updating rain status record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete rain status record
const deleteRainStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRecord = await prisma.rainStatus.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Rain status record not found'
      });
    }

    await prisma.rainStatus.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Rain status record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rain status record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get rain history with time range filtering
const getRainHistory = async (req, res) => {
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

    const rainHistory = await prisma.rainStatus.findMany({
      where: whereClause,
      skip,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'asc'
      }
    });

    const total = await prisma.rainStatus.count({ where: whereClause });

    // Add rain info and format for chart display
    const historyWithInfo = rainHistory.map(record => ({
      ...record,
      rainInfo: getRainDetectionInfo(record.status),
      timestamp: record.createdAt.toISOString()
    }));

    // Calculate statistics
    const statusValues = rainHistory.map(h => h.status);
    const rainDetectedCount = rainHistory.filter(h => h.status > 20).length;
    const noRainCount = rainHistory.filter(h => h.status <= 20).length;

    const stats = {
      averageIntensity: statusValues.length > 0 ? (statusValues.reduce((a, b) => a + b, 0) / statusValues.length).toFixed(2) : 0,
      minimumIntensity: statusValues.length > 0 ? Math.min(...statusValues) : 0,
      maximumIntensity: statusValues.length > 0 ? Math.max(...statusValues) : 0,
      totalReadings: statusValues.length,
      rainDetectedCount: rainDetectedCount,
      noRainCount: noRainCount,
      rainPercentage: statusValues.length > 0 ? ((rainDetectedCount / statusValues.length) * 100).toFixed(1) : 0
    };

    res.status(200).json({
      success: true,
      message: 'Rain history retrieved successfully',
      data: historyWithInfo,
      statistics: stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching rain history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get rain statistics summary
const getRainStatistics = async (req, res) => {
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

    const rainReadings = await prisma.rainStatus.findMany({
      where: {
        createdAt: {
          gte: startTime
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Categorize readings
    const rainEvents = rainReadings.filter(r => r.status > 20);
    const noRainEvents = rainReadings.filter(r => r.status <= 20);

    // Calculate rain events and duration
    let rainEventsToday = 0;
    let totalRainDuration = 0;
    let lastRainTime = null;

    if (rainEvents.length > 0) {
      rainEventsToday = rainEvents.length;
      lastRainTime = rainEvents[0].createdAt;
      
      // Estimate total duration (simplified calculation)
      totalRainDuration = rainEvents.length * 5; // Assuming 5 minutes per reading
    }

    const currentReading = rainReadings.length > 0 ? rainReadings[0] : null;
    const currentRainInfo = currentReading ? getRainDetectionInfo(currentReading.status) : null;

    // Calculate average intensity
    const avgIntensity = rainEvents.length > 0 
      ? (rainEvents.reduce((sum, event) => sum + event.status, 0) / rainEvents.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      message: 'Rain statistics retrieved successfully',
      data: {
        currentReading: currentReading ? {
          ...currentReading,
          rainInfo: currentRainInfo
        } : null,
        statistics: {
          timeRange,
          totalReadings: rainReadings.length,
          rainEventsToday: rainEventsToday,
          totalDuration: `${totalRainDuration} min`,
          lastRainTime: lastRainTime ? lastRainTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }) : '--',
          averageIntensity: avgIntensity || '--',
          rainPercentage: rainReadings.length > 0 ? ((rainEvents.length / rainReadings.length) * 100).toFixed(1) : 0,
          noRainPercentage: rainReadings.length > 0 ? ((noRainEvents.length / rainReadings.length) * 100).toFixed(1) : 0
        },
        threshold: {
          value: 20,
          rule: 'Value > 20 = Rain Detected, Value <= 20 = No Rain Detected'
        },
        intensityLevels: {
          dry: { min: 0, max: 20, label: 'Dry' },
          damp: { min: 21, max: 30, label: 'Damp' },
          lightRain: { min: 31, max: 40, label: 'Light Rain' },
          rain: { min: 41, max: 60, label: 'Rain' },
          heavyRain: { min: 61, max: 80, label: 'Heavy Rain' },
          storm: { min: 81, max: 100, label: 'Storm' }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching rain statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createRainStatus,
  getAllRainStatus,
  getRainStatusById,
  getCurrentRainStatus,
  updateRainStatus,
  deleteRainStatus,
  getRainHistory,
  getRainStatistics
};
