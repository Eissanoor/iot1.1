const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class FAQ {
  // Create a new FAQ
  static async create(data) {
    return prisma.faq.create({
      data
    });
  }

  // Find all FAQs
  static async findAll() {
    return prisma.faq.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  // Find a FAQ by ID
  static async findById(id) {
    return prisma.faq.findUnique({
      where: { id: Number(id) }
    });
  }

  // Find FAQs by name (search functionality)
  static async findByName(name) {
    return prisma.faq.findMany({
      where: {
        OR: [
          { name: { contains: name, mode: 'insensitive' } },
          { name_ar: { contains: name, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Update a FAQ by ID
  static async updateById(id, data) {
    return prisma.faq.update({
      where: { id: Number(id) },
      data
    });
  }

  // Delete a FAQ by ID
  static async deleteById(id) {
    return prisma.faq.delete({
      where: { id: Number(id) }
    });
  }

  // Get FAQ count
  static async count() {
    return prisma.faq.count();
  }
}

module.exports = FAQ;
