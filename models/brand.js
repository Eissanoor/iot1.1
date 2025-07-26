const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class Brand {
  static async create(data) {
    return prisma.brand.create({
      data
    });
  }

  static async findAll() {
    return prisma.brand.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async findById(id) {
    return prisma.brand.findUnique({
      where: { id: Number(id) }
    });
  }

  static async update(id, data) {
    return prisma.brand.update({
      where: { id: Number(id) },
      data
    });
  }

  static async delete(id) {
    return prisma.brand.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = Brand; 