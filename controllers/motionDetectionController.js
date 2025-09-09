const MotionDetection = require('../models/motionDetection');
const { createError } = require('../utils/createError');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new motion detection record
const createMotionDetection = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return next(createError(400, 'Status is required'));
    }

    const motionDetection = await MotionDetection.create({ status });

    res.status(201).json({
      success: true,
      message: 'Motion detection record created successfully',
      data: motionDetection,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get all motion detection records
const getAllMotionDetections = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    if (page && limit) {
      const result = await MotionDetection.findWithPagination(
        parseInt(page),
        parseInt(limit)
      );
      return res.status(200).json({
        success: true,
        message: 'Motion detection records fetched successfully',
        data: result,
      });
    }

    const motionDetections = await MotionDetection.findAll();

    res.status(200).json({
      success: true,
      message: 'Motion detection records fetched successfully',
      data: motionDetections,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get motion detection record by ID
const getMotionDetectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const motionDetection = await MotionDetection.findById(id);

    if (!motionDetection) {
      return next(createError(404, 'Motion detection record not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Motion detection record fetched successfully',
      data: motionDetection,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get latest motion detection record
const getLatestMotionDetection = async (req, res, next) => {
  try {
    const latestMotion = await MotionDetection.findLatest();

    if (!latestMotion) {
      return res.status(200).json({
        success: true,
        message: 'No motion detection records found',
        data: {
          status: 'No Motion',
          lastDetected: 'Never',
        },
      });
    }

    // Calculate time difference for "Last detected" display
    const now = new Date();
    const detectedTime = new Date(latestMotion.createdAt);
    const timeDiff = now - detectedTime;
    
    let lastDetected;
    if (timeDiff < 60000) { // Less than 1 minute
      lastDetected = 'Just now';
    } else if (timeDiff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(timeDiff / 60000);
      lastDetected = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (timeDiff < 86400000) { // Less than 1 day
      const hours = Math.floor(timeDiff / 3600000);
      lastDetected = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(timeDiff / 86400000);
      lastDetected = `${days} day${days > 1 ? 's' : ''} ago`;
    }

    res.status(200).json({
      success: true,
      message: 'Latest motion detection record fetched successfully',
      data: {
        ...latestMotion,
        lastDetected,
      },
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get motion detection statistics (for the UI cards)
const getMotionDetectionStats = async (req, res, next) => {
  try {
    const [todayCount, weekCount, monthCount] = await Promise.all([
      MotionDetection.getTodayStats(),
      MotionDetection.getWeekStats(),
      MotionDetection.getMonthStats(),
    ]);

    res.status(200).json({
      success: true,
      message: 'Motion detection statistics fetched successfully',
      data: {
        today: todayCount,
        thisWeek: weekCount,
        thisMonth: monthCount,
      },
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Get motion detection activity data for chart
const getMotionDetectionActivity = async (req, res, next) => {
  try {
    const { days = 7, period = '7days' } = req.query;
    
    let activityData;
    
    if (period === '24hours') {
      // Get hourly data for last 24 hours
      activityData = await getHourlyActivity();
    } else if (period === '30days') {
      // Get daily data for last 30 days
      activityData = await MotionDetection.getActivityData(30);
    } else {
      // Default: Get daily data for last 7 days
      activityData = await MotionDetection.getActivityData(parseInt(days));
    }

    res.status(200).json({
      success: true,
      message: 'Motion detection activity data fetched successfully',
      data: activityData,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Helper function to get hourly activity data
const getHourlyActivity = async () => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const data = [];
    
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(twentyFourHoursAgo.getTime() + i * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
      
      const count = await prisma.motionDetection.count({
        where: {
          createdAt: {
            gte: hourStart,
            lt: hourEnd,
          },
        },
      });
      
      data.push({
        hour: hourStart.getHours(),
        count: count,
        time: hourStart.toISOString(),
      });
    }
    
    return data;
  } catch (error) {
    throw new Error(`Error fetching hourly activity data: ${error.message}`);
  }
};

// Get motion detection dashboard data (combines status, stats, and activity)
const getMotionDetectionDashboard = async (req, res, next) => {
  try {
    const [latestMotion, stats, activityData] = await Promise.all([
      MotionDetection.findLatest(),
      Promise.all([
        MotionDetection.getTodayStats(),
        MotionDetection.getWeekStats(),
        MotionDetection.getMonthStats(),
      ]),
      MotionDetection.getActivityData(7),
    ]);

    // Process latest motion data
    let motionStatus = {
      status: 'No Motion',
      lastDetected: 'Never',
    };

    if (latestMotion) {
      const now = new Date();
      const detectedTime = new Date(latestMotion.createdAt);
      const timeDiff = now - detectedTime;
      
      let lastDetected;
      if (timeDiff < 60000) {
        lastDetected = 'Just now';
      } else if (timeDiff < 3600000) {
        const minutes = Math.floor(timeDiff / 60000);
        lastDetected = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (timeDiff < 86400000) {
        const hours = Math.floor(timeDiff / 3600000);
        lastDetected = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(timeDiff / 86400000);
        lastDetected = `${days} day${days > 1 ? 's' : ''} ago`;
      }

      motionStatus = {
        status: latestMotion.status,
        lastDetected,
      };
    }

    res.status(200).json({
      success: true,
      message: 'Motion detection dashboard data fetched successfully',
      data: {
        motionStatus,
        statistics: {
          today: stats[0],
          thisWeek: stats[1],
          thisMonth: stats[2],
        },
        activityChart: activityData,
      },
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Update motion detection record
const updateMotionDetection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(createError(400, 'Status is required'));
    }

    const motionDetection = await MotionDetection.update(id, { status });

    res.status(200).json({
      success: true,
      message: 'Motion detection record updated successfully',
      data: motionDetection,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// Delete motion detection record
const deleteMotionDetection = async (req, res, next) => {
  try {
    const { id } = req.params;
    await MotionDetection.delete(id);

    res.status(200).json({
      success: true,
      message: 'Motion detection record deleted successfully',
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

module.exports = {
  createMotionDetection,
  getAllMotionDetections,
  getMotionDetectionById,
  getLatestMotionDetection,
  getMotionDetectionStats,
  getMotionDetectionActivity,
  getMotionDetectionDashboard,
  updateMotionDetection,
  deleteMotionDetection,
};
