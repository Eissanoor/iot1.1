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
  },
  // Delete oldest records
  deleteOldest: async (count) => {
    // Find the oldest records
    const oldestRecords = await prisma.temperature.findMany({
      orderBy: { timestamp: 'asc' },
      take: count,
      select: { id: true }
    });
    
    // Extract IDs
    const idsToDelete = oldestRecords.map(record => record.id);
    
    // Delete these records
    return prisma.temperature.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });
  },
  getStats: (since) => {
    return prisma.temperature.findMany({
      where: {
        timestamp: {
          gte: since
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  },
  getHistorical: async (since, interval) => {
    // This is a simplified approach - for production, you might want to use 
    // raw SQL queries with proper time-based grouping for better performance
    const data = await prisma.temperature.findMany({
      where: {
        timestamp: {
          gte: since
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
    
    // Process data based on interval
    if (interval === 'hour') {
      // Group by hour
      const hourlyData = {};
      data.forEach(record => {
        const hourKey = new Date(record.timestamp).setMinutes(0, 0, 0);
        if (!hourlyData[hourKey]) {
          hourlyData[hourKey] = {
            timestamp: new Date(hourKey),
            temperature: [],
            humidity: []
          };
        }
        hourlyData[hourKey].temperature.push(record.temperature);
        hourlyData[hourKey].humidity.push(record.humidity);
      });
      
      // Calculate averages
      return Object.values(hourlyData).map(hour => ({
        timestamp: hour.timestamp,
        temperature: parseFloat((hour.temperature.reduce((a, b) => a + b, 0) / hour.temperature.length).toFixed(1)),
        humidity: parseFloat((hour.humidity.reduce((a, b) => a + b, 0) / hour.humidity.length).toFixed(1))
      }));
    } else {
      // Group by day
      const dailyData = {};
      data.forEach(record => {
        const dayKey = new Date(record.timestamp).setHours(0, 0, 0, 0);
        if (!dailyData[dayKey]) {
          dailyData[dayKey] = {
            timestamp: new Date(dayKey),
            temperature: [],
            humidity: []
          };
        }
        dailyData[dayKey].temperature.push(record.temperature);
        dailyData[dayKey].humidity.push(record.humidity);
      });
      
      // Calculate averages
      return Object.values(dailyData).map(day => ({
        timestamp: day.timestamp,
        temperature: parseFloat((day.temperature.reduce((a, b) => a + b, 0) / day.temperature.length).toFixed(1)),
        humidity: parseFloat((day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length).toFixed(1))
      }));
    }
  }
};