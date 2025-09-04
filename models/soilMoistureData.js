const prisma = require('../prisma/client');

// Export Prisma SoilMoistureData model operations
module.exports = {
  create: (data) => {
    return prisma.soilMoistureData.create({
      data: {
        moisture: data.moisture
      }
    });
  },
  findMany: (options = {}) => {
    const { skip, take, orderBy = { timestamp: 'desc' } } = options;
    return prisma.soilMoistureData.findMany({
      skip,
      take,
      orderBy
    });
  },
  count: () => {
    return prisma.soilMoistureData.count();
  },
  findFirst: (options = {}) => {
    const { orderBy = { timestamp: 'desc' } } = options;
    return prisma.soilMoistureData.findFirst({
      orderBy
    });
  },
  deleteMany: (where) => {
    return prisma.soilMoistureData.deleteMany({
      where
    });
  },
  // Delete oldest records
  deleteOldest: async (count) => {
    // Find the oldest records
    const oldestRecords = await prisma.soilMoistureData.findMany({
      orderBy: { timestamp: 'asc' },
      take: count,
      select: { id: true }
    });
    
    // Extract IDs
    const idsToDelete = oldestRecords.map(record => record.id);
    
    // Delete these records
    return prisma.soilMoistureData.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });
  }
};