const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class AccessLevel {
  // Create a new access level
  static async create(data) {
    return prisma.accessLevel.create({
      data,
    });
  }

  // Get all access levels
  static async findAll() {
    return prisma.accessLevel.findMany();
  }

  // Get access level by ID
  static async findById(id) {
    return prisma.accessLevel.findUnique({
      where: { id: Number(id) },
    });
  }

  // Update access level
  static async update(id, data) {
    return prisma.accessLevel.update({
      where: { id: Number(id) },
      data
    });
  }

  // Delete access level
  static async delete(id) {
    return prisma.accessLevel.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = AccessLevel;

