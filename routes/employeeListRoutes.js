const express = require('express');
const router = express.Router();
const employeeListController = require('../controllers/employeeListController');
const { verifyAdminToken } = require('../middleware/auth');
const { upload } = require('../utils/uploadUtils');

// Create a new employee (with image upload)
router.post('/', verifyAdminToken, upload.single('image'), employeeListController.createEmployee);

// Get all employees
router.get('/', employeeListController.getAllEmployees);

// Get employee by ID
router.get('/:id', employeeListController.getEmployeeById);

// Update employee (with optional image upload)
router.put('/:id', verifyAdminToken, upload.single('image'), employeeListController.updateEmployee);

// Delete employee
router.delete('/:id', verifyAdminToken, employeeListController.deleteEmployee);

module.exports = router; 