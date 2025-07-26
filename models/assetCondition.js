const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class AssetCondition {
  static async create(data) {
    return prisma.assetCondition.create({
      data
    });
  }

  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [assetConditions, totalCount] = await Promise.all([
      prisma.assetCondition.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.assetCondition.count()
    ]);
    
    return {
      assetConditions,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  static async findById(id) {
    return prisma.assetCondition.findUnique({
      where: { id: Number(id) }
    });
  }

  static async update(id, data) {
    return prisma.assetCondition.update({
      where: { id: Number(id) },
      data
    });
  }

  static async delete(id) {
    return prisma.assetCondition.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = AssetCondition; 