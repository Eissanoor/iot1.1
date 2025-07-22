const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class Location {
  // Create a new location
  static async create(locationData) {
    return prisma.location.create({
      data: locationData
    });
  }

  // Get all locations
  static async getAll() {
    return prisma.location.findMany();
  }

  // Get location by ID
  static async getById(id) {
    return prisma.location.findUnique({
      where: { id: parseInt(id) }
    });
  }

  // Get location by location code
  static async getByCode(locationCode) {
    return prisma.location.findUnique({
      where: { locationCode }
    });
  }

  // Update location
  static async update(id, locationData) {
    return prisma.location.update({
      where: { id: parseInt(id) },
      data: locationData
    });
  }

  // Delete location
  static async delete(id) {
    return prisma.location.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = Location; 