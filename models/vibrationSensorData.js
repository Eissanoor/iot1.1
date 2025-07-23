const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

// Create new vibration sensor data
const createVibrationData = async (data) => {
  return await prisma.vibrationSensor.create({
    data: {
      amplitude: data.amplitude,
      frequency: data.frequency,
      axisX: data.axisX,
      axisY: data.axisY,
      axisZ: data.axisZ,
      rms: data.rms,
      peakValue: data.peakValue,
      deviceId: data.deviceId
    }
  });
};

// Get all vibration sensor data
const getAllVibrationData = async () => {
  return await prisma.vibrationSensor.findMany({
    orderBy: {
      timestamp: 'desc'
    }
  });
};

// Get vibration data by ID
const getVibrationDataById = async (id) => {
  return await prisma.vibrationSensor.findUnique({
    where: { id: parseInt(id) }
  });
};

// Get latest vibration data
const getLatestVibrationData = async () => {
  return await prisma.vibrationSensor.findFirst({
    orderBy: {
      timestamp: 'desc'
    }
  });
};

// Get vibration data by device ID
const getVibrationDataByDeviceId = async (deviceId) => {
  return await prisma.vibrationSensor.findMany({
    where: { deviceId },
    orderBy: {
      timestamp: 'desc'
    }
  });
};

// Get vibration data within a time range
const getVibrationDataByTimeRange = async (startTime, endTime) => {
  return await prisma.vibrationSensor.findMany({
    where: {
      timestamp: {
        gte: new Date(startTime),
        lte: new Date(endTime)
      }
    },
    orderBy: {
      timestamp: 'asc'
    }
  });
};

// Delete vibration data by ID
const deleteVibrationData = async (id) => {
  return await prisma.vibrationSensor.delete({
    where: { id: parseInt(id) }
  });
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