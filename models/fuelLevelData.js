const prisma = require('../prisma/client');

/**
 * Create a new fuel level data entry
 * @param {Object} data - Fuel level data
 * @param {number} data.level - Current fuel level
 * @param {number} data.capacity - Total fuel capacity
 * @returns {Promise<Object>} Created fuel level data
 */
async function createFuelLevelData(data) {
  return await prisma.fuelLevel.create({
    data: {
      level: data.level,
      capacity: data.capacity,
    },
  });
}

/**
 * Get all fuel level data entries
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of entries to return
 * @returns {Promise<Array>} List of fuel level data entries
 */
async function getAllFuelLevelData(options = { limit: 100 }) {
  return await prisma.fuelLevel.findMany({
    take: options.limit,
    orderBy: {
      timestamp: 'desc',
    },
  });
}

/**
 * Get latest fuel level data entry
 * @returns {Promise<Object>} Latest fuel level data
 */
async function getLatestFuelLevelData() {
  return await prisma.fuelLevel.findFirst({
    orderBy: {
      timestamp: 'desc',
    },
  });
}

/**
 * Get fuel level data within a date range
 * @param {Object} range - Date range
 * @param {Date} range.startDate - Start date
 * @param {Date} range.endDate - End date
 * @returns {Promise<Array>} List of fuel level data entries within range
 */
async function getFuelLevelDataByDateRange(range) {
  return await prisma.fuelLevel.findMany({
    where: {
      timestamp: {
        gte: range.startDate,
        lte: range.endDate,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
}

/**
 * Count fuel level data entries
 * @returns {Promise<number>} Count of fuel level data entries
 */
async function count() {
  return await prisma.fuelLevel.count();
}

/**
 * Delete oldest fuel level data entries
 * @param {number} count - Number of oldest entries to delete
 * @returns {Promise<Object>} Result of delete operation
 */
async function deleteOldest(count) {
  // Find the oldest records
  const oldestRecords = await prisma.fuelLevel.findMany({
    orderBy: { timestamp: 'asc' },
    take: count,
    select: { id: true }
  });
  
  // Extract IDs
  const idsToDelete = oldestRecords.map(record => record.id);
  
  // Delete these records
  return prisma.fuelLevel.deleteMany({
    where: {
      id: { in: idsToDelete }
    }
  });
}

module.exports = {
  createFuelLevelData,
  getAllFuelLevelData,
  getLatestFuelLevelData,
  getFuelLevelDataByDateRange,
  count,
  deleteOldest
};