const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all FourthContainers
const getAllFourthContainers = async () => {
  return await prisma.fourthContainer.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Get FourthContainer by ID
const getFourthContainerById = async (id) => {
  const container = await prisma.fourthContainer.findUnique({
    where: {
      id: parseInt(id),
    },
  });
  
  if (container) {
    // Parse points from JSON string to array
    container.points = JSON.parse(container.points || '[]');
  }
  
  return container;
};

// Create new FourthContainer
const createFourthContainer = async (data) => {
  // Convert points array to JSON string
  const pointsString = JSON.stringify(data.points || []);
  
  return await prisma.fourthContainer.create({
    data: {
      name: data.name,
      name_ar: data.name_ar,
      description: data.description,
      description_ar: data.description_ar,
      image: data.image,
      status: data.status !== undefined ? data.status : true,
      url: data.url,
      points: pointsString,
    },
  });
};

// Update FourthContainer
const updateFourthContainer = async (id, data) => {
  // Convert points array to JSON string if provided
  const updateData = {
    name: data.name,
    name_ar: data.name_ar,
    description: data.description,
    description_ar: data.description_ar,
    image: data.image,
    status: data.status !== undefined ? data.status : undefined,
    url: data.url,
  };
  
  // Only update points if provided
  if (data.points) {
    updateData.points = JSON.stringify(data.points);
  }
  
  const updated = await prisma.fourthContainer.update({
    where: {
      id: parseInt(id),
    },
    data: updateData,
  });
  
  // Parse points from JSON string to array for the response
  if (updated) {
    updated.points = JSON.parse(updated.points || '[]');
  }
  
  return updated;
};

// Delete FourthContainer
const deleteFourthContainer = async (id) => {
  return await prisma.fourthContainer.delete({
    where: {
      id: parseInt(id),
    },
  });
};

// Update FourthContainer status
const updateFourthContainerStatus = async (id, status) => {
  const updated = await prisma.fourthContainer.update({
    where: {
      id: parseInt(id),
    },
    data: {
      status: status,
    },
  });
  
  // Parse points from JSON string to array for the response
  if (updated) {
    updated.points = JSON.parse(updated.points || '[]');
  }
  
  return updated;
};

// Update FourthContainer points
const updateFourthContainerPoints = async (id, points) => {
  const pointsString = JSON.stringify(points || []);
  
  const updated = await prisma.fourthContainer.update({
    where: {
      id: parseInt(id),
    },
    data: {
      points: pointsString,
    },
  });
  
  // Parse points from JSON string to array for the response
  if (updated) {
    updated.points = JSON.parse(updated.points || '[]');
  }
  
  return updated;
};

module.exports = {
  getAllFourthContainers,
  getFourthContainerById,
  createFourthContainer,
  updateFourthContainer,
  deleteFourthContainer,
  updateFourthContainerStatus,
  updateFourthContainerPoints,
};
