const prisma = require('../prisma/client');

class City {
  // Create a new city with related departments
  static async create(data) {
    const { departmentIds = [], ...cityData } = data;

    return prisma.city.create({
      data: {
        ...cityData,
        departments: departmentIds.length
          ? {
              connect: departmentIds.map((id) => ({ id: Number(id) })),
            }
          : undefined,
      },
      include: {
        departments: true,
      },
    });
  }

  // Get all cities with their departments
  static async findAll() {
    return prisma.city.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        departments: true,
      },
    });
  }

  // Get city by ID
  static async findById(id) {
    return prisma.city.findUnique({
      where: { id: Number(id) },
      include: {
        departments: true,
      },
    });
  }

  // Update city and its departments
  static async update(id, data) {
    const { departmentIds, ...cityData } = data;

    return prisma.city.update({
      where: { id: Number(id) },
      data: {
        ...cityData,
        ...(Array.isArray(departmentIds)
          ? {
              departments: {
                set: departmentIds.map((depId) => ({ id: Number(depId) })),
              },
            }
          : {}),
      },
      include: {
        departments: true,
      },
    });
  }

  // Delete city
  static async delete(id) {
    return prisma.city.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = City;


