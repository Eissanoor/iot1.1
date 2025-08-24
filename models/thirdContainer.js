const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all ThirdContainers
const getAllThirdContainers = async () => {
  return await prisma.thirdContainer.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Get ThirdContainer by ID
const getThirdContainerById = async (id) => {
  return await prisma.thirdContainer.findUnique({
    where: {
      id: parseInt(id),
    },
  });
};

// Create new ThirdContainer
const createThirdContainer = async (data) => {
  return await prisma.thirdContainer.create({
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

// Update ThirdContainer
const updateThirdContainer = async (id, data) => {
  return await prisma.thirdContainer.update({
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

// Delete ThirdContainer
const deleteThirdContainer = async (id) => {
  return await prisma.thirdContainer.delete({
    where: {
      id: parseInt(id),
    },
  });
};

// Update ThirdContainer status
const updateThirdContainerStatus = async (id, status) => {
  return await prisma.thirdContainer.update({
    where: {
      id: parseInt(id),
    },
    data: {
      status: status,
    },
  });
};

module.exports = {
  getAllThirdContainers,
  getThirdContainerById,
  createThirdContainer,
  updateThirdContainer,
  deleteThirdContainer,
  updateThirdContainerStatus,
};
