const prisma = require('../prisma/client');

class AssetBrand {
  static async create(data) {
    return prisma.assetBrand.create({
      data,
    });
  }

  static async findAll() {
    return prisma.assetBrand.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async findById(id) {
    return prisma.assetBrand.findUnique({
      where: { id: Number(id) },
    });
  }

  static async update(id, data) {
    return prisma.assetBrand.update({
      where: { id: Number(id) },
      data,
    });
  }

  static async delete(id) {
    return prisma.assetBrand.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = AssetBrand;


