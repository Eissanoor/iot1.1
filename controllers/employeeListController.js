const EmployeeList = require('../models/employeeList');

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    const { employeeName, jobType } = req.body;

    // Validate input
    if (!employeeName || !jobType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee name and job type are required' 
      });
    }

    const employee = await EmployeeList.create({
      employeeName,
      jobType
    });

    return res.status(201).json({
      success: true,
      data: employee,
      message: 'Employee created successfully'
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeList.findAll();
    
    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await EmployeeList.findById(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${id} not found`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employee',
      error: error.message
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, jobType } = req.body;
    
    // Check if employee exists
    const existingEmployee = await EmployeeList.findById(id);
    
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${id} not found`
      });
    }
    
    // Update employee
    const updatedEmployee = await EmployeeList.update(id, {
      employeeName: employeeName || existingEmployee.employeeName,
      jobType: jobType || existingEmployee.jobType
    });
    
    return res.status(200).json({
      success: true,
      data: updatedEmployee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if employee exists
    const employee = await EmployeeList.findById(id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${id} not found`
      });
    }
    
    // Delete employee
    await EmployeeList.delete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
}; 