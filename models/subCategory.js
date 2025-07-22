const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class SubCategory {
  // Create a new subcategory
  static async create(data) {
    return prisma.subCategory.create({
      data,
      include: {
        category: true
      }
    });
  }

  // Find all subcategories
  static async findAll() {
    return prisma.subCategory.findMany({
      include: {
        category: true
      }
    });
  }

  // Find all subcategories by category ID
  static async findByCategoryId(categoryId) {
    return prisma.subCategory.findMany({
      where: { categoryId: Number(categoryId) },
      include: {
        category: true
      }
    });
  }

  // Find a subcategory by ID
  static async findById(id) {
    return prisma.subCategory.findUnique({
      where: { id: Number(id) },
      include: {
        category: true
      }
    });
  }

  // Find a subcategory by name within a category
  static async findByNameAndCategory(name, categoryId) {
    return prisma.subCategory.findFirst({
      where: { 
        name,
        categoryId: Number(categoryId)
      },
      include: {
        category: true
      }
    });
  }

  // Update a subcategory by ID
  static async updateById(id, data) {
    return prisma.subCategory.update({
      where: { id: Number(id) },
      data,
      include: {
        category: true
      }
    });
  }

  // Delete a subcategory by ID
  static async deleteById(id) {
    return prisma.subCategory.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = SubCategory; 