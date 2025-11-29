const EmployeeList = require('../models/employeeList');
const path = require('path');

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      departmentId, 
      roleId, 
      jobTitle, 
      status, 
      joiningDate,
      employeeName, // Keeping for backward compatibility
      jobType // Keeping for backward compatibility
    } = req.body;

    // Validate required input
    if (!firstName || !lastName || !email || !jobTitle || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'firstName, lastName, email, jobTitle, and status are required' 
      });
    }

    // Handle image upload
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Prepare employee data
    const employeeData = {
      firstName,
      lastName,
      email,
      jobTitle,
      status,
      ...(imagePath ? { image: imagePath } : {}),
      ...(joiningDate ? { joiningDate: new Date(joiningDate) } : {}),
      ...(departmentId ? { departmentId: Number(departmentId) } : {}),
      ...(roleId ? { roleId: Number(roleId) } : {}),
      ...(employeeName ? { employeeName } : {}),
      ...(jobType ? { jobType } : {}),
    };

    const employee = await EmployeeList.create(employeeData);

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
    const { 
      firstName, 
      lastName, 
      email, 
      departmentId, 
      roleId, 
      jobTitle, 
      status, 
      joiningDate,
      employeeName, // Keeping for backward compatibility
      jobType // Keeping for backward compatibility
    } = req.body;
    
    // Check if employee exists
    const existingEmployee = await EmployeeList.findById(id);
    
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID ${id} not found`
      });
    }
    
    // Handle image upload
    let imagePath = existingEmployee.image;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    
    // Prepare update data
    const updateData = {
      firstName: firstName !== undefined ? firstName : existingEmployee.firstName,
      lastName: lastName !== undefined ? lastName : existingEmployee.lastName,
      email: email !== undefined ? email : existingEmployee.email,
      jobTitle: jobTitle !== undefined ? jobTitle : existingEmployee.jobTitle,
      status: status !== undefined ? status : existingEmployee.status,
      image: imagePath,
      ...(joiningDate !== undefined ? { joiningDate: joiningDate ? new Date(joiningDate) : null } : {}),
      ...(departmentId !== undefined ? { departmentId: departmentId ? Number(departmentId) : null } : {}),
      ...(roleId !== undefined ? { roleId: roleId ? Number(roleId) : null } : {}),
      ...(employeeName !== undefined ? { employeeName } : {}),
      ...(jobType !== undefined ? { jobType } : {}),
    };
    
    // Update employee
    const updatedEmployee = await EmployeeList.update(id, updateData);
    
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