const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new department
const createDepartment = async (departmentData) => {
  return await prisma.department.create({
    data: departmentData,
  });
};

// Get all departments with pagination
const getAllDepartments = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const [departments, totalCount] = await Promise.all([
    prisma.department.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.department.count(),
  ]);

  return {
    departments,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
    },
  };
};

// Get department by ID
const getDepartmentById = async (id) => {
  return await prisma.department.findUnique({
    where: { id: parseInt(id) },
  });
};

// Get department by code
const getDepartmentByCode = async (code) => {
  return await prisma.department.findUnique({
    where: { departmentCode: code },
  });
};

// Update department
const updateDepartment = async (id, departmentData) => {
  return await prisma.department.update({
    where: { id: parseInt(id) },
    data: departmentData,
  });
};

// Delete department
const deleteDepartment = async (id) => {
  return await prisma.department.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  getDepartmentByCode,
  updateDepartment,
  deleteDepartment,
}; 