const commentModel = require('../models/comment');
const { upload, getImageUrl } = require('../utils/uploadUtils');
const fs = require('fs');
const path = require('path');
const { createError } = require('../utils/createError');

// Handle file upload with multer middleware
const uploadImage = upload.single('image');

// Get all Comments
const getAllComments = async (req, res, next) => {
  try {
    const comments = await commentModel.getAllComments();
    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(createError(500, 'Error retrieving comments'));
  }
};

// Get Comment by ID
const getCommentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await commentModel.getCommentById(id);
    
    if (!comment) {
      return next(createError(404, 'Comment not found'));
    }
    
    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(createError(500, 'Error retrieving comment'));
  }
};

// Create new Comment
const createComment = async (req, res, next) => {
  try {
    // Handle file upload
    uploadImage(req, res, async function(err) {
      if (err) {
        return next(createError(400, err.message));
      }
      
      try {
        const { name, title, title_ar, description, description_ar } = req.body;
        
        // Validate required fields
        if (!name || !title || !title_ar) {
          // Remove uploaded file if validation fails
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return next(createError(400, 'Name, title, and title_ar are required fields'));
        }
        
        // Prepare data for database
        const commentData = {
          name,
          title,
          title_ar,
          description,
          description_ar,
          image: req.file ? getImageUrl(req.file.filename) : null
        };
        
        const newComment = await commentModel.createComment(commentData);
        
        res.status(201).json({
          success: true,
          data: newComment
        });
      } catch (error) {
        // Remove uploaded file if database operation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        next(createError(500, 'Error creating comment'));
      }
    });
  } catch (error) {
    next(createError(500, 'Error processing request'));
  }
};

// Update Comment
const updateComment = async (req, res, next) => {
  try {
    // Handle file upload
    uploadImage(req, res, async function(err) {
      if (err) {
        return next(createError(400, err.message));
      }
      
      try {
        const { id } = req.params;
        const { name, title, title_ar, description, description_ar } = req.body;
        
        // Check if Comment exists
        const existingComment = await commentModel.getCommentById(id);
        if (!existingComment) {
          // Remove uploaded file if Comment doesn't exist
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return next(createError(404, 'Comment not found'));
        }
        
        // Validate required fields
        if (!name || !title || !title_ar) {
          // Remove uploaded file if validation fails
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return next(createError(400, 'Name, title, and title_ar are required fields'));
        }
        
        // Prepare data for database
        const commentData = {
          name,
          title,
          title_ar,
          description,
          description_ar
        };
        
        // Handle image update
        if (req.file) {
          commentData.image = getImageUrl(req.file.filename);
          
          // Delete old image if it exists
          if (existingComment.image) {
            const oldImagePath = path.join(__dirname, '..', existingComment.image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
        }
        
        const updatedComment = await commentModel.updateComment(id, commentData);
        
        res.status(200).json({
          success: true,
          data: updatedComment
        });
      } catch (error) {
        // Remove uploaded file if database operation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        next(createError(500, 'Error updating comment'));
      }
    });
  } catch (error) {
    next(createError(500, 'Error processing request'));
  }
};

// Delete Comment
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if Comment exists
    const existingComment = await commentModel.getCommentById(id);
    if (!existingComment) {
      return next(createError(404, 'Comment not found'));
    }
    
    // Delete the Comment
    await commentModel.deleteComment(id);
    
    // Delete associated image if it exists
    if (existingComment.image) {
      const imagePath = path.join(__dirname, '..', existingComment.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(createError(500, 'Error deleting comment'));
  }
};

module.exports = {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment
};
