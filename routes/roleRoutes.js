const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyAdminToken } = require('../middleware/auth');

// Create a new role - protected route
router.post('/', verifyAdminToken, roleController.createRole);

// Get all roles
router.get('/', roleController.getAllRoles);

// Get role by ID - protected route
router.get('/:id', verifyAdminToken, roleController.getRoleById);

// Update role - protected route
router.put('/:id', verifyAdminToken, roleController.updateRole);

// Delete role - protected route
router.delete('/:id', verifyAdminToken, roleController.deleteRole);

module.exports = router;

