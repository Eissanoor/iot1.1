const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyAdminToken } = require('../middleware/auth');

// Create a new department - protected route
router.post('/', verifyAdminToken, departmentController.createDepartment);

// Get all departments with pagination - protected route
router.get('/',  departmentController.getAllDepartments);

// Get department by ID - protected route
router.get('/:id', verifyAdminToken, departmentController.getDepartmentById);

// Update department - protected route
router.put('/:id', verifyAdminToken, departmentController.updateDepartment);

// Delete department - protected route
router.delete('/:id', verifyAdminToken, departmentController.deleteDepartment);

module.exports = router; 