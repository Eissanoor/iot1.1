const NPKSensorData = require('../models/npkSensorData');

// Controller methods
const createNPKData = async (req, res) => {
  try {
    const npkData = await NPKSensorData.createNPKData(req.body);
    res.status(201).json({
      success: true,
      data: npkData
    });
  } catch (error) {
    console.error('Error creating NPK data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create NPK data',
      error: error.message
    });
  }
};

// Get all NPK sensor data
const getAllNPKData = async (req, res) => {
  try {
    // Get query parameters for filtering
    const limit = parseInt(req.query.limit) || 100; // Default to 100 records
    const skip = parseInt(req.query.skip) || 0;
    
    const npkData = await NPKSensorData.getAllNPKData({
      skip: skip,
      take: limit,
      orderBy: { timestamp: 'desc' }
    });
    
    // Get total count
    const count = await NPKSensorData.count();
    
    res.status(200).json({
      success: true,
      count,
      data: npkData
    });
  } catch (error) {
    console.error('Error fetching NPK data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NPK data',
      error: error.message
    });
  }
};

// Get NPK data by ID
const getNPKDataById = async (req, res) => {
  try {
    const npkData = await NPKSensorData.getNPKDataById(req.params.id);
    if (!npkData) {
      return res.status(404).json({
        success: false,
        message: 'NPK data not found'
      });
    }
    res.status(200).json({
      success: true,
      data: npkData
    });
  } catch (error) {
    console.error('Error fetching NPK data by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NPK data',
      error: error.message
    });
  }
};

// Get latest NPK data
const getLatestNPKData = async (req, res) => {
  try {
    const npkData = await NPKSensorData.getLatestNPKData();
    if (!npkData) {
      return res.status(404).json({
        success: false,
        message: 'No NPK data found'
      });
    }
    res.status(200).json({
      success: true,
      data: npkData
    });
  } catch (error) {
    console.error('Error fetching latest NPK data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest NPK data',
      error: error.message
    });
  }
};

// Get NPK data by device ID
const getNPKDataByDeviceId = async (req, res) => {
  try {
    const npkData = await NPKSensorData.getNPKDataByDeviceId(req.params.deviceId);
    res.status(200).json({
      success: true,
      count: npkData.length,
      data: npkData
    });
  } catch (error) {
    console.error('Error fetching NPK data by device ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NPK data by device ID',
      error: error.message
    });
  }
};

// Get NPK data by time range
const getNPKDataByTimeRange = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startTime and endTime parameters'
      });
    }
    
    const npkData = await NPKSensorData.getNPKDataByTimeRange(startTime, endTime);
    res.status(200).json({
      success: true,
      count: npkData.length,
      data: npkData
    });
  } catch (error) {
    console.error('Error fetching NPK data by time range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NPK data by time range',
      error: error.message
    });
  }
};

// Delete NPK data by ID
const deleteNPKData = async (req, res) => {
  try {
    const npkData = await NPKSensorData.deleteNPKData(req.params.id);
    res.status(200).json({
      success: true,
      message: 'NPK data deleted successfully',
      data: npkData
    });
  } catch (error) {
    console.error('Error deleting NPK data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete NPK data',
      error: error.message
    });
  }
};

module.exports = {
  createNPKData,
  getAllNPKData,
  getNPKDataById,
  getLatestNPKData,
  getNPKDataByDeviceId,
  getNPKDataByTimeRange,
  deleteNPKData
};