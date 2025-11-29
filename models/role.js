const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class Role {
  // Create a new role
  static async create(data) {
    return prisma.role.create({
      data,
    });
  }

  // Get all roles
  static async findAll() {
    return prisma.role.findMany({
      include: {
        employees: true, // include related employees if any
        accessLevel: true, // include related access level if any
      },
    });
  }

  // Get role by ID
  static async findById(id) {
    return prisma.role.findUnique({
      where: { id: Number(id) },
      include: {
        employees: true,
        accessLevel: true,
      },
    });
  }

  // Update role
  static async update(id, data) {
    return prisma.role.update({
      where: { id: Number(id) },
      data
    });
  }

  // Delete role
  static async delete(id) {
    return prisma.role.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = Role;

