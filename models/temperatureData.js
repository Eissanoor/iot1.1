const prisma = require('../prisma/client');

// Export Prisma Temperature model operations
module.exports = {
  create: (data) => {
    return prisma.temperature.create({
      data: {
        temperature: data.temperature,
        humidity: data.humidity
      }
    });
  },
  findMany: (options = {}) => {
    const { skip, take, orderBy = { timestamp: 'desc' } } = options;
    return prisma.temperature.findMany({
      skip,
      take,
      orderBy
    });
  },
  count: () => {
    return prisma.temperature.count();
  },
  findFirst: (options = {}) => {
    const { orderBy = { timestamp: 'desc' } } = options;
    return prisma.temperature.findFirst({
      orderBy
    });
  },
  deleteMany: (where) => {
    return prisma.temperature.deleteMany({
      where
    });
  }
}; 