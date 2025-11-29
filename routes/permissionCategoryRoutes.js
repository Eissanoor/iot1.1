const express = require('express');
const router = express.Router();
const permissionCategoryController = require('../controllers/permissionCategoryController');
const { verifyAdminToken } = require('../middleware/auth');

// Create a new permission category - protected route
router.post('/', verifyAdminToken, permissionCategoryController.createPermissionCategory);

// Get all permission categories
router.get('/', permissionCategoryController.getAllPermissionCategories);

// Get permission category by ID - protected route
router.get('/:id', verifyAdminToken, permissionCategoryController.getPermissionCategoryById);

// Update permission category - protected route
router.put('/:id', verifyAdminToken, permissionCategoryController.updatePermissionCategory);

// Delete permission category - protected route
router.delete('/:id', verifyAdminToken, permissionCategoryController.deletePermissionCategory);

module.exports = router;

