const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { verifyAdminToken } = require('../middleware/auth');

// Create a new permission - protected route
router.post('/', verifyAdminToken, permissionController.createPermission);

// Get all permissions
router.get('/', permissionController.getAllPermissions);

// Get permissions grouped by category
router.get('/grouped', permissionController.getPermissionsByCategory);

// Get permissions by category ID
router.get('/category/:categoryId', permissionController.getPermissionsByCategoryId);

// Get permission by ID - protected route
router.get('/:id', verifyAdminToken, permissionController.getPermissionById);

// Update permission - protected route
router.put('/:id', verifyAdminToken, permissionController.updatePermission);

// Delete permission - protected route
router.delete('/:id', verifyAdminToken, permissionController.deletePermission);

module.exports = router;

