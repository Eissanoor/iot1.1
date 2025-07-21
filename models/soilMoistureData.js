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
  }
}; 