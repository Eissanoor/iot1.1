const prisma = require('../prisma/client');

// Create new NPK sensor data
const createNPKData = async (data) => {
  return await prisma.nPKSensor.create({
    data: {
      nitrogen: data.nitrogen,
      phosphorus: data.phosphorus,
      potassium: data.potassium,
      ph: data.ph,
      deviceId: data.deviceId
    }
  });
};

// Get all NPK sensor data
const getAllNPKData = async (options = {}) => {
  const { skip, take, orderBy = { timestamp: 'desc' } } = options;
  return await prisma.nPKSensor.findMany({
    skip,
    take,
    orderBy
  });
};

// Get NPK data by ID
const getNPKDataById = async (id) => {
  return await prisma.nPKSensor.findUnique({
    where: { id: parseInt(id) }
  });
};

// Get latest NPK data
const getLatestNPKData = async () => {
  return await prisma.nPKSensor.findFirst({
    orderBy: {
      timestamp: 'desc'
    }
  });
};

// Get NPK data by device ID
const getNPKDataByDeviceId = async (deviceId) => {
  return await prisma.nPKSensor.findMany({
    where: { deviceId },
    orderBy: {
      timestamp: 'desc'
    }
  });
};

// Get NPK data within a time range
const getNPKDataByTimeRange = async (startTime, endTime) => {
  return await prisma.nPKSensor.findMany({
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

// Delete NPK data by ID
const deleteNPKData = async (id) => {
  return await prisma.nPKSensor.delete({
    where: { id: parseInt(id) }
  });
};

// Count NPK data
const count = () => {
  return prisma.nPKSensor.count();
};

// Delete oldest NPK data entries
const deleteOldest = async (count) => {
  // Find the oldest records
  const oldestRecords = await prisma.nPKSensor.findMany({
    orderBy: { timestamp: 'asc' },
    take: count,
    select: { id: true }
  });
  
  // Extract IDs
  const idsToDelete = oldestRecords.map(record => record.id);
  
  // Delete these records
  return prisma.nPKSensor.deleteMany({
    where: {
      id: { in: idsToDelete }
    }
  });
};

module.exports = {
  createNPKData,
  getAllNPKData,
  getNPKDataById,
  getLatestNPKData,
  getNPKDataByDeviceId,
  getNPKDataByTimeRange,
  deleteNPKData,
  count,
  deleteOldest
};