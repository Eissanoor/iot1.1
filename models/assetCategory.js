const prisma = require('../prisma/client');

class AssetCategory {
  static async create(data) {
    return prisma.assetCategory.create({
      data,
    });
  }

  static async findAll() {
    return prisma.assetCategory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findById(id) {
    return prisma.assetCategory.findUnique({
      where: { id: Number(id) },
    });
  }

  static async update(id, data) {
    return prisma.assetCategory.update({
      where: { id: Number(id) },
      data,
    });
  }

  static async delete(id) {
    return prisma.assetCategory.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = AssetCategory;


