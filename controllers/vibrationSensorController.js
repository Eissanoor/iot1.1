const vibrationModel = require('../models/vibrationSensorData');
const sensorUtils = require('../utils/sensorUtils');

// Controller methods
const createVibrationData = async (req, res) => {
  try {
    const vibrationData = await vibrationModel.createVibrationData(req.body);
    res.status(201).json({
      success: true,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error creating vibration data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vibration data',
      error: error.message
    });
  }
};

// Get all vibration sensor data
const getAllVibrationData = async (req, res) => {
  try {
    // Get query parameters for filtering
    const limit = parseInt(req.query.limit) || 100; // Default to 100 records
    const skip = parseInt(req.query.skip) || 0;
    
    const vibrationData = await vibrationModel.getAllVibrationData();
    res.status(200).json({
      success: true,
      count: vibrationData.length,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error fetching vibration data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vibration data',
      error: error.message
    });
  }
};

// Get vibration data by ID
const getVibrationDataById = async (req, res) => {
  try {
    const vibrationData = await vibrationModel.getVibrationDataById(req.params.id);
    if (!vibrationData) {
      return res.status(404).json({
        success: false,
        message: 'Vibration data not found'
      });
    }
    res.status(200).json({
      success: true,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error fetching vibration data by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vibration data',
      error: error.message
    });
  }
};

// Get latest vibration data
const getLatestVibrationData = async (req, res) => {
  try {
    const vibrationData = await vibrationModel.getLatestVibrationData();
    if (!vibrationData) {
      return res.status(404).json({
        success: false,
        message: 'No vibration data found'
      });
    }
    res.status(200).json({
      success: true,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error fetching latest vibration data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest vibration data',
      error: error.message
    });
  }
};

// Get vibration data by device ID
const getVibrationDataByDeviceId = async (req, res) => {
  try {
    const vibrationData = await vibrationModel.getVibrationDataByDeviceId(req.params.deviceId);
    res.status(200).json({
      success: true,
      count: vibrationData.length,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error fetching vibration data by device ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vibration data by device ID',
      error: error.message
    });
  }
};

// Get vibration data by time range
const getVibrationDataByTimeRange = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startTime and endTime parameters'
      });
    }
    
    const vibrationData = await vibrationModel.getVibrationDataByTimeRange(startTime, endTime);
    res.status(200).json({
      success: true,
      count: vibrationData.length,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error fetching vibration data by time range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vibration data by time range',
      error: error.message
    });
  }
};

// Delete vibration data by ID
const deleteVibrationData = async (req, res) => {
  try {
    const vibrationData = await vibrationModel.deleteVibrationData(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Vibration data deleted successfully',
      data: vibrationData
    });
  } catch (error) {
    console.error('Error deleting vibration data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vibration data',
      error: error.message
    });
  }
};

module.exports = {
  createVibrationData,
  getAllVibrationData,
  getVibrationDataById,
  getLatestVibrationData,
  getVibrationDataByDeviceId,
  getVibrationDataByTimeRange,
  deleteVibrationData
}; 