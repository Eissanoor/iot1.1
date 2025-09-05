const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to determine car detection status based on distance
const getCarDetectionStatus = (distance) => {
  if (distance < 7) {
    return {
      detected: true,
      status: 'Car Detected',
      message: 'Vehicle detected within range',
      color: 'red'
    };
  } else {
    return {
      detected: false,
      status: 'No Car Detected',
      message: 'No vehicle detected',
      color: 'green'
    };
  }
};

// Create new car detection record
const createCarDetection = async (req, res) => {
  try {
    const { distance } = req.body;

    if (distance === undefined || distance === null) {
      return res.status(400).json({
        success: false,
        message: 'Distance is required'
      });
    }

    const detectionInfo = getCarDetectionStatus(parseFloat(distance));

    const carDetection = await prisma.carDetection.create({
      data: {
        distance: parseFloat(distance),
        status: detectionInfo.status
      }
    });

    res.status(201).json({
      success: true,
      message: 'Car detection record created successfully',
      data: {
        ...carDetection,
        detectionInfo: detectionInfo,
        unit: 'cm'
      }
    });
  } catch (error) {
    console.error('Error creating car detection record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all car detection records
const getAllCarDetections = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const carDetections = await prisma.carDetection.findMany({
      skip,
      take: parseInt(limit),
      orderBy: {
        [sortBy]: sortOrder
      }
    });

    const total = await prisma.carDetection.count();

    // Add detection info to each record
    const carDetectionsWithInfo = carDetections.map(detection => ({
      ...detection,
      detectionInfo: getCarDetectionStatus(detection.distance),
      unit: 'cm'
    }));

    res.status(200).json({
      success: true,
      message: 'Car detection records retrieved successfully',
      data: carDetectionsWithInfo,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching car detection records:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get car detection record by ID
const getCarDetectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const carDetection = await prisma.carDetection.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!carDetection) {
      return res.status(404).json({
        success: false,
        message: 'Car detection record not found'
      });
    }

    const detectionInfo = getCarDetectionStatus(carDetection.distance);

    res.status(200).json({
      success: true,
      message: 'Car detection record retrieved successfully',
      data: {
        ...carDetection,
        detectionInfo: detectionInfo,
        unit: 'cm'
      }
    });
  } catch (error) {
    console.error('Error fetching car detection record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get current/latest car detection status
const getCurrentCarDetection = async (req, res) => {
  try {
    const latestCarDetection = await prisma.carDetection.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!latestCarDetection) {
      return res.status(404).json({
        success: false,
        message: 'No car detection records found'
      });
    }

    const detectionInfo = getCarDetectionStatus(latestCarDetection.distance);

    res.status(200).json({
      success: true,
      message: 'Current car detection status retrieved successfully',
      data: {
        ...latestCarDetection,
        detectionInfo: detectionInfo,
        sensorType: 'Ultrasonic Sensor',
        unit: 'cm',
        threshold: 7
      }
    });
  } catch (error) {
    console.error('Error fetching current car detection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update car detection record
const updateCarDetection = async (req, res) => {
  try {
    const { id } = req.params;
    const { distance } = req.body;

    if (distance === undefined || distance === null) {
      return res.status(400).json({
        success: false,
        message: 'Distance is required'
      });
    }

    const existingRecord = await prisma.carDetection.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Car detection record not found'
      });
    }

    const detectionInfo = getCarDetectionStatus(parseFloat(distance));

    const updatedCarDetection = await prisma.carDetection.update({
      where: {
        id: parseInt(id)
      },
      data: {
        distance: parseFloat(distance),
        status: detectionInfo.status
      }
    });

    res.status(200).json({
      success: true,
      message: 'Car detection record updated successfully',
      data: {
        ...updatedCarDetection,
        detectionInfo: detectionInfo,
        unit: 'cm'
      }
    });
  } catch (error) {
    console.error('Error updating car detection record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete car detection record
const deleteCarDetection = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRecord = await prisma.carDetection.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Car detection record not found'
      });
    }

    await prisma.carDetection.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.status(200).json({
      success: true,
      message: 'Car detection record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting car detection record:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get car detection history with time range filtering
const getCarDetectionHistory = async (req, res) => {
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

    const carHistory = await prisma.carDetection.findMany({
      where: whereClause,
      skip,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'asc'
      }
    });

    const total = await prisma.carDetection.count({ where: whereClause });

    // Add detection info and format for chart display
    const historyWithInfo = carHistory.map(detection => ({
      ...detection,
      detectionInfo: getCarDetectionStatus(detection.distance),
      timestamp: detection.createdAt.toISOString(),
      unit: 'cm'
    }));

    // Calculate statistics
    const distances = carHistory.map(h => h.distance);
    const detectedCount = carHistory.filter(h => h.distance < 7).length;
    const notDetectedCount = carHistory.filter(h => h.distance >= 7).length;

    const stats = {
      averageDistance: distances.length > 0 ? (distances.reduce((a, b) => a + b, 0) / distances.length).toFixed(2) : 0,
      minimumDistance: distances.length > 0 ? Math.min(...distances) : 0,
      maximumDistance: distances.length > 0 ? Math.max(...distances) : 0,
      totalReadings: distances.length,
      carDetectedCount: detectedCount,
      noCarDetectedCount: notDetectedCount,
      detectionRate: distances.length > 0 ? ((detectedCount / distances.length) * 100).toFixed(1) : 0
    };

    res.status(200).json({
      success: true,
      message: 'Car detection history retrieved successfully',
      data: historyWithInfo,
      statistics: stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching car detection history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get detection summary
const getDetectionSummary = async (req, res) => {
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

    const carReadings = await prisma.carDetection.findMany({
      where: {
        createdAt: {
          gte: startTime
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Categorize readings by detection status
    const detectedCount = carReadings.filter(r => r.distance < 7).length;
    const notDetectedCount = carReadings.filter(r => r.distance >= 7).length;

    const currentReading = carReadings.length > 0 ? carReadings[0] : null;
    const currentDetection = currentReading ? getCarDetectionStatus(currentReading.distance) : null;

    res.status(200).json({
      success: true,
      message: 'Detection summary retrieved successfully',
      data: {
        currentReading: currentReading ? {
          ...currentReading,
          detectionInfo: currentDetection,
          unit: 'cm'
        } : null,
        summary: {
          timeRange,
          totalReadings: carReadings.length,
          carDetectedCount: detectedCount,
          noCarDetectedCount: notDetectedCount,
          detectionPercentage: carReadings.length > 0 ? ((detectedCount / carReadings.length) * 100).toFixed(1) : 0,
          noDetectionPercentage: carReadings.length > 0 ? ((notDetectedCount / carReadings.length) * 100).toFixed(1) : 0
        },
        threshold: {
          value: 7,
          unit: 'cm',
          rule: 'Distance < 7cm = Car Detected, Distance >= 7cm = No Car Detected'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching detection summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createCarDetection,
  getAllCarDetections,
  getCarDetectionById,
  getCurrentCarDetection,
  updateCarDetection,
  deleteCarDetection,
  getCarDetectionHistory,
  getDetectionSummary
};
