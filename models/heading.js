const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all Headings
const getAllHeadings = async () => {
  return await prisma.heading.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Get Heading by ID
const getHeadingById = async (id) => {
  return await prisma.heading.findUnique({
    where: {
      id: parseInt(id),
    },
  });
};

// Create new Heading
const createHeading = async (data) => {
  return await prisma.heading.create({
    data: {
      name: data.name,
      name_ar: data.name_ar,
      caption: data.caption,
      caption_ar: data.caption_ar,
    },
  });
};

// Update Heading
const updateHeading = async (id, data) => {
  const updateData = {
    name: data.name,
    name_ar: data.name_ar,
    caption: data.caption,
    caption_ar: data.caption_ar,
  };
  
  return await prisma.heading.update({
    where: {
      id: parseInt(id),
    },
    data: updateData,
  });
};

// Delete Heading
const deleteHeading = async (id) => {
  return await prisma.heading.delete({
    where: {
      id: parseInt(id),
    },
  });
};

module.exports = {
  getAllHeadings,
  getHeadingById,
  createHeading,
  updateHeading,
  deleteHeading,
};
