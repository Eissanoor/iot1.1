const express = require('express');
const router = express.Router();
const employeeListController = require('../controllers/employeeListController');
const { verifyToken } = require('../middleware/auth');

// Create a new employee
router.post('/', verifyToken, employeeListController.createEmployee);

// Get all employees
router.get('/', employeeListController.getAllEmployees);

// Get employee by ID
router.get('/:id', employeeListController.getEmployeeById);

// Update employee
router.put('/:id', verifyToken, employeeListController.updateEmployee);

// Delete employee
router.delete('/:id', verifyToken, employeeListController.deleteEmployee);

module.exports = router; 