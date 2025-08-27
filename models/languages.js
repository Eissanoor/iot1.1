const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class Languages {
  async create(data) {
    return prisma.languages.create({
      data
    });
  }

  async findAll() {
    return prisma.languages.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id) {
    return prisma.languages.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async findByKey(key) {
    return prisma.languages.findUnique({
      where: { key }
    });
  }

  async update(id, data) {
    return prisma.languages.update({
      where: { id: parseInt(id) },
      data
    });
  }

  async delete(id) {
    return prisma.languages.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new Languages();
