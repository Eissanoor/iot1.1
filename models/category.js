const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class Category {
  // Create a new category
  static async create(data) {
    return prisma.category.create({
      data
    });
  }

  // Find all categories with their subcategories
  static async findAll() {
    return prisma.category.findMany({
      include: {
        subCategories: true
      }
    });
  }

  // Find a category by ID with its subcategories
  static async findById(id) {
    return prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        subCategories: true
      }
    });
  }

  // Find a category by name
  static async findByName(name) {
    return prisma.category.findUnique({
      where: { name },
      include: {
        subCategories: true
      }
    });
  }

  // Update a category by ID
  static async updateById(id, data) {
    return prisma.category.update({
      where: { id: Number(id) },
      data,
      include: {
        subCategories: true
      }
    });
  }

  // Delete a category by ID
  static async deleteById(id) {
    return prisma.category.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = Category; 