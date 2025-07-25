const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class SubMegaMenu {
  // Create a new sub mega menu
  static async create(data) {
    return await prisma.subMegaMenu.create({
      data
    });
  }

  // Get all sub mega menus
  static async getAll() {
    return await prisma.subMegaMenu.findMany({
      include: {
        megaMenu: true
      }
    });
  }

  // Get sub mega menus by mega menu ID
  static async getByMegaMenuId(megamenu_id) {
    return await prisma.subMegaMenu.findMany({
      where: { megamenu_id: parseInt(megamenu_id) },
      include: {
        megaMenu: true
      }
    });
  }

  // Get a single sub mega menu by ID
  static async getById(id) {
    return await prisma.subMegaMenu.findUnique({
      where: { id: parseInt(id) },
      include: {
        megaMenu: true
      }
    });
  }

  // Update a sub mega menu
  static async update(id, data) {
    return await prisma.subMegaMenu.update({
      where: { id: parseInt(id) },
      data
    });
  }

  // Delete a sub mega menu
  static async delete(id) {
    return await prisma.subMegaMenu.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = SubMegaMenu; 