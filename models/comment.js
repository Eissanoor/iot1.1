const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all Comments
const getAllComments = async () => {
  return await prisma.comment.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Get Comment by ID
const getCommentById = async (id) => {
  return await prisma.comment.findUnique({
    where: {
      id: parseInt(id),
    },
  });
};

// Create new Comment
const createComment = async (data) => {
  return await prisma.comment.create({
    data: {
      name: data.name,
      title: data.title,
      title_ar: data.title_ar,
      description: data.description,
      description_ar: data.description_ar,
      image: data.image,
    },
  });
};

// Update Comment
const updateComment = async (id, data) => {
  return await prisma.comment.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name: data.name,
      title: data.title,
      title_ar: data.title_ar,
      description: data.description,
      description_ar: data.description_ar,
      image: data.image,
    },
  });
};

// Delete Comment
const deleteComment = async (id) => {
  return await prisma.comment.delete({
    where: {
      id: parseInt(id),
    },
  });
};

module.exports = {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
};
