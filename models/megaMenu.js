const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class MegaMenu {
  // Create a new mega menu
  static async create(data) {
    return await prisma.megaMenu.create({
      data
    });
  }

  // Get all mega menus
  static async getAll() {
    return await prisma.megaMenu.findMany({
      include: {
        subMenus: true
      }
    });
  }

  // Get a single mega menu by ID
  static async getById(id) {
    return await prisma.megaMenu.findUnique({
      where: { id: parseInt(id) },
      include: {
        subMenus: true
      }
    });
  }

  // Update a mega menu
  static async update(id, data) {
    return await prisma.megaMenu.update({
      where: { id: parseInt(id) },
      data
    });
  }

  // Delete a mega menu
  static async delete(id) {
    return await prisma.megaMenu.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = MegaMenu; 