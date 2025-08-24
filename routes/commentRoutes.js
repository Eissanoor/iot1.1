const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middleware/auth');

// Get all comments
router.get('/', commentController.getAllComments);

// Get comment by ID
router.get('/:id', commentController.getCommentById);

// Create new comment (protected route)
router.post('/', verifyToken, commentController.createComment);

// Update comment (protected route)
router.put('/:id', verifyToken, commentController.updateComment);

// Delete comment (protected route)
router.delete('/:id', verifyToken, commentController.deleteComment);

module.exports = router;
