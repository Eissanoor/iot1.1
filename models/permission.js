const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class Permission {
  // Create a new permission
  static async create(data) {
    return prisma.permission.create({
      data,
    });
  }

  // Get all permissions
  static async findAll() {
    return prisma.permission.findMany({
      include: {
        category: true, // include related category
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ],
    });
  }

  // Get permissions by category ID
  static async findByCategoryId(categoryId) {
    return prisma.permission.findMany({
      where: { categoryId: Number(categoryId) },
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // Get permission by ID
  static async findById(id) {
    return prisma.permission.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  // Update permission
  static async update(id, data) {
    return prisma.permission.update({
      where: { id: Number(id) },
      data
    });
  }

  // Delete permission
  static async delete(id) {
    return prisma.permission.delete({
      where: { id: Number(id) }
    });
  }

  // Get permissions grouped by category
  static async findGroupedByCategory() {
    const permissions = await prisma.permission.findMany({
      include: {
        category: true,
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ],
    });

    // Group by category
    const grouped = permissions.reduce((acc, permission) => {
      const categoryName = permission.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(permission);
      return acc;
    }, {});

    return grouped;
  }
}

module.exports = Permission;

