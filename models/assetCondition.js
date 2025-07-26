const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class AssetCondition {
  static async create(data) {
    return prisma.assetCondition.create({
      data
    });
  }

  static async findAll() {
    return prisma.assetCondition.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
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