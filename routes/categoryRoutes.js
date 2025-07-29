const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyAdminToken } = require('../middleware/auth');

// Get all categories - public access
router.get('/', categoryController.getAllCategories);

// Get category by ID - public access
router.get('/:id', categoryController.getCategoryById);

// Create new category - protected route
router.post('/', verifyAdminToken, categoryController.createCategory);

// Update category - protected route
router.put('/:id', verifyAdminToken, categoryController.updateCategory);

// Delete category - protected route
router.delete('/:id', verifyAdminToken, categoryController.deleteCategory);

module.exports = router; 