const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class Header {
  async create(data) {
    return prisma.header.create({
      data
    });
  }

  async findAll() {
    return prisma.header.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findById(id) {
    return prisma.header.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async update(id, data) {
    return prisma.header.update({
      where: { id: parseInt(id) },
      data
    });
  }

  async delete(id) {
    return prisma.header.delete({
      where: { id: parseInt(id) }
    });
  }

  async updateStatus(id, status) {
    return prisma.header.update({
      where: { id: parseInt(id) },
      data: { status }
    });
  }
}

module.exports = new Header();
