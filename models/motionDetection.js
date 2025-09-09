const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MotionDetection {
  // Create a new motion detection record
  static async create(data) {
    try {
      return await prisma.motionDetection.create({
        data: {
          status: data.status,
        },
      });
    } catch (error) {
      throw new Error(`Error creating motion detection record: ${error.message}`);
    }
  }

  // Get all motion detection records
  static async findAll() {
    try {
      return await prisma.motionDetection.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new Error(`Error fetching motion detection records: ${error.message}`);
    }
  }

  // Get motion detection record by ID
  static async findById(id) {
    try {
      return await prisma.motionDetection.findUnique({
        where: { id: parseInt(id) },
      });
    } catch (error) {
      throw new Error(`Error fetching motion detection record: ${error.message}`);
    }
  }

  // Get latest motion detection record
  static async findLatest() {
    try {
      return await prisma.motionDetection.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new Error(`Error fetching latest motion detection record: ${error.message}`);
    }
  }

  // Get motion detection statistics for today
  static async getTodayStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const count = await prisma.motionDetection.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      return count;
    } catch (error) {
      throw new Error(`Error fetching today's motion detection stats: ${error.message}`);
    }
  }

  // Get motion detection statistics for this week
  static async getWeekStats() {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const count = await prisma.motionDetection.count({
        where: {
          createdAt: {
            gte: startOfWeek,
          },
        },
      });

      return count;
    } catch (error) {
      throw new Error(`Error fetching this week's motion detection stats: ${error.message}`);
    }
  }

  // Get motion detection statistics for this month
  static async getMonthStats() {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const count = await prisma.motionDetection.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      });

      return count;
    } catch (error) {
      throw new Error(`Error fetching this month's motion detection stats: ${error.message}`);
    }
  }

  // Get motion detection activity data for chart (last 7 days)
  static async getActivityData(days = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days + 1);
      startDate.setHours(0, 0, 0, 0);

      const data = [];
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + 1);

        const count = await prisma.motionDetection.count({
          where: {
            createdAt: {
              gte: currentDate,
              lt: nextDate,
            },
          },
        });

        data.push({
          day: dayNames[currentDate.getDay()],
          count: count,
          date: currentDate.toISOString().split('T')[0],
        });
      }

      return data;
    } catch (error) {
      throw new Error(`Error fetching motion detection activity data: ${error.message}`);
    }
  }

  // Update motion detection record
  static async update(id, data) {
    try {
      return await prisma.motionDetection.update({
        where: { id: parseInt(id) },
        data: {
          status: data.status,
        },
      });
    } catch (error) {
      throw new Error(`Error updating motion detection record: ${error.message}`);
    }
  }

  // Delete motion detection record
  static async delete(id) {
    try {
      return await prisma.motionDetection.delete({
        where: { id: parseInt(id) },
      });
    } catch (error) {
      throw new Error(`Error deleting motion detection record: ${error.message}`);
    }
  }

  // Get motion detection records with pagination
  static async findWithPagination(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [records, total] = await Promise.all([
        prisma.motionDetection.findMany({
          skip: skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.motionDetection.count(),
      ]);

      return {
        records,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new Error(`Error fetching paginated motion detection records: ${error.message}`);
    }
  }
}

module.exports = MotionDetection;
