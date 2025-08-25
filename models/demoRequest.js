const prisma = require('../prisma/client');

class DemoRequest {
  static async create(data) {
    return prisma.demoRequest.create({
      data: {
        email: data.email,
        phoneNumber: data.phoneNumber,
        companyName: data.companyName,
        message: data.message || null
      }
    });
  }

  static async getAll() {
    return prisma.demoRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async getById(id) {
    return prisma.demoRequest.findUnique({
      where: { id: parseInt(id) }
    });
  }

  static async update(id, data) {
    return prisma.demoRequest.update({
      where: { id: parseInt(id) },
      data
    });
  }

  static async delete(id) {
    return prisma.demoRequest.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = DemoRequest;
