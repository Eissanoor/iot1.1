const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all FirstContainers
const getAllFirstContainers = async () => {
  return await prisma.firstContainer.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Get FirstContainer by ID
const getFirstContainerById = async (id) => {
  return await prisma.firstContainer.findUnique({
    where: {
      id: parseInt(id),
    },
  });
};

// Create new FirstContainer
const createFirstContainer = async (data) => {
  return await prisma.firstContainer.create({
    data: {
      name: data.name,
      name_ar: data.name_ar,
      description: data.description,
      description_ar: data.description_ar,
      image: data.image,
      status: data.status !== undefined ? data.status : true,
      url: data.url,
    },
  });
};

// Update FirstContainer
const updateFirstContainer = async (id, data) => {
  return await prisma.firstContainer.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name: data.name,
      name_ar: data.name_ar,
      description: data.description,
      description_ar: data.description_ar,
      image: data.image,
      status: data.status !== undefined ? data.status : undefined,
      url: data.url,
    },
  });
};

// Delete FirstContainer
const deleteFirstContainer = async (id) => {
  return await prisma.firstContainer.delete({
    where: {
      id: parseInt(id),
    },
  });
};

// Update FirstContainer status
const updateFirstContainerStatus = async (id, status) => {
  return await prisma.firstContainer.update({
    where: {
      id: parseInt(id),
    },
    data: {
      status: status,
    },
  });
};

module.exports = {
  getAllFirstContainers,
  getFirstContainerById,
  createFirstContainer,
  updateFirstContainer,
  deleteFirstContainer,
  updateFirstContainerStatus,
};
