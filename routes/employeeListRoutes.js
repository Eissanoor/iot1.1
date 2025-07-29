const express = require('express');
const router = express.Router();
const employeeListController = require('../controllers/employeeListController');
const { verifyAdminToken } = require('../middleware/auth');

// Create a new employee
router.post('/', verifyAdminToken, employeeListController.createEmployee);

// Get all employees
router.get('/', employeeListController.getAllEmployees);

// Get employee by ID
router.get('/:id', employeeListController.getEmployeeById);

// Update employee
router.put('/:id', verifyAdminToken, employeeListController.updateEmployee);

// Delete employee
router.delete('/:id', verifyAdminToken, employeeListController.deleteEmployee);

module.exports = router; 