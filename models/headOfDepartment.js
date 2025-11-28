const { PrismaClient } = require('@prisma/client');
const prisma = require('../prisma/client');

// Create a new head of department
const createHeadOfDepartment = async (headData) => {
  return await prisma.headOfDepartment.create({
    data: headData,
  });
};

// Get all heads of department with pagination
const getAllHeadsOfDepartment = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const [heads, totalCount] = await Promise.all([
    prisma.headOfDepartment.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        departments: true, // include related departments
      },
    }),
    prisma.headOfDepartment.count(),
  ]);

  return {
    heads,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
    },
  };
};

// Get head of department by ID
const getHeadOfDepartmentById = async (id) => {
  return await prisma.headOfDepartment.findUnique({
    where: { id: parseInt(id) },
    include: {
      departments: true, // include related departments
    },
  });
};

// Update head of department
const updateHeadOfDepartment = async (id, headData) => {
  return await prisma.headOfDepartment.update({
    where: { id: parseInt(id) },
    data: headData,
  });
};

// Delete head of department
const deleteHeadOfDepartment = async (id) => {
  return await prisma.headOfDepartment.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  createHeadOfDepartment,
  getAllHeadsOfDepartment,
  getHeadOfDepartmentById,
  updateHeadOfDepartment,
  deleteHeadOfDepartment,
};

