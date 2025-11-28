const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

class EmployeeList {
  // Create a new employee
  static async create(data) {
    return prisma.employeeList.create({
      data,
    });
  }

  // Get all employees
  static async findAll() {
    return prisma.employeeList.findMany({
      include: {
        department: true, // include related department if any
      },
    });
  }

  // Get employee by ID
  static async findById(id) {
    return prisma.employeeList.findUnique({
      where: { id: Number(id) },
      include: {
        department: true,
      },
    });
  }

  // Update employee
  static async update(id, data) {
    return prisma.employeeList.update({
      where: { id: Number(id) },
      data
    });
  }

  // Delete employee
  static async delete(id) {
    return prisma.employeeList.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = EmployeeList; 