const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all SecondContainers
const getAllSecondContainers = async () => {
  return await prisma.secondContainer.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Get SecondContainer by ID
const getSecondContainerById = async (id) => {
  return await prisma.secondContainer.findUnique({
    where: {
      id: parseInt(id),
    },
  });
};

// Create new SecondContainer
const createSecondContainer = async (data) => {
  return await prisma.secondContainer.create({
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

// Update SecondContainer
const updateSecondContainer = async (id, data) => {
  return await prisma.secondContainer.update({
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

// Delete SecondContainer
const deleteSecondContainer = async (id) => {
  return await prisma.secondContainer.delete({
    where: {
      id: parseInt(id),
    },
  });
};

// Update SecondContainer status
const updateSecondContainerStatus = async (id, status) => {
  return await prisma.secondContainer.update({
    where: {
      id: parseInt(id),
    },
    data: {
      status: status,
    },
  });
};

module.exports = {
  getAllSecondContainers,
  getSecondContainerById,
  createSecondContainer,
  updateSecondContainer,
  deleteSecondContainer,
  updateSecondContainerStatus,
};
