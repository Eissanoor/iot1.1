const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class PermissionCategory {
  // Create a new permission category
  static async create(data) {
    return prisma.permissionCategory.create({
      data,
    });
  }

  // Get all permission categories
  static async findAll() {
    return prisma.permissionCategory.findMany({
      include: {
        permissions: true, // include related permissions
      },
      orderBy: {
        name: 'asc'
      },
    });
  }

  // Get permission category by ID
  static async findById(id) {
    return prisma.permissionCategory.findUnique({
      where: { id: Number(id) },
      include: {
        permissions: true,
      },
    });
  }

  // Update permission category
  static async update(id, data) {
    return prisma.permissionCategory.update({
      where: { id: Number(id) },
      data
    });
  }

  // Delete permission category
  static async delete(id) {
    return prisma.permissionCategory.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = PermissionCategory;

