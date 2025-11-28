const departmentModel = require('../models/department');

// Create a new department
const createDepartment = async (req, res) => {
  try {
    const {
      departmentCode,
      departmentName,
      departmentDescription,
      location,
      annualBudget,
      status,
      hodId,
    } = req.body;
    
    // Check if required fields are provided
    if (!departmentCode || !departmentName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department code and name are required' 
      });
    }
    
    // Check if department with the same code already exists
    const existingDepartment = await departmentModel.getDepartmentByCode(departmentCode);
    if (existingDepartment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Department with this code already exists' 
      });
    }
    
    // If hodId is provided, verify it exists
    if (hodId !== undefined && hodId !== null) {
      const prisma = require('../prisma/client');
      const headOfDept = await prisma.headOfDepartment.findUnique({
        where: { id: Number(hodId) }
      });
      if (!headOfDept) {
        return res.status(400).json({ 
          success: false, 
          message: 'Head of Department with provided ID does not exist' 
        });
      }
    }
    
    const department = await departmentModel.createDepartment({
      departmentCode,
      departmentName,
      departmentDescription: departmentDescription || '',
      location: location || '',
      annualBudget: annualBudget || '',
      status: status || 'active',
      ...(hodId !== undefined && hodId !== null
        ? { hodId: Number(hodId) }
        : {}),
    });
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create department', 
      error: error.message 
    });
  }
};

// Get all departments with pagination
const getAllDepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await departmentModel.getAllDepartments(page, limit);
    
    res.status(200).json({
      success: true,
      message: 'Departments retrieved successfully',
      data: result.departments,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error retrieving departments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve departments', 
      error: error.message 
    });
  }
};

// Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await departmentModel.getDepartmentById(id);
    
    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Department retrieved successfully',
      data: department
    });
  } catch (error) {
    console.error('Error retrieving department:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve department', 
      error: error.message 
    });
  }
};

// Update department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      departmentCode,
      departmentName,
      departmentDescription,
      location,
      annualBudget,
      status,
      hodId,
    } = req.body;
    
    // Check if department exists
    const existingDepartment = await departmentModel.getDepartmentById(id);
    if (!existingDepartment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }
    
    // If updating code, check if new code already exists (but not for this department)
    if (departmentCode && departmentCode !== existingDepartment.departmentCode) {
      const departmentWithCode = await departmentModel.getDepartmentByCode(departmentCode);
      if (departmentWithCode && departmentWithCode.id !== parseInt(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Department with this code already exists' 
        });
      }
    }
    
    // If hodId is provided, verify it exists
    if (hodId !== undefined && hodId !== null) {
      const prisma = require('../prisma/client');
      const headOfDept = await prisma.headOfDepartment.findUnique({
        where: { id: Number(hodId) }
      });
      if (!headOfDept) {
        return res.status(400).json({ 
          success: false, 
          message: 'Head of Department with provided ID does not exist' 
        });
      }
    }
    
    const updatedDepartment = await departmentModel.updateDepartment(id, {
      departmentCode: departmentCode || existingDepartment.departmentCode,
      departmentName: departmentName || existingDepartment.departmentName,
      departmentDescription: departmentDescription ?? existingDepartment.departmentDescription,
      location: location ?? existingDepartment.location,
      annualBudget: annualBudget ?? existingDepartment.annualBudget,
      status: status ?? existingDepartment.status,
      hodId:
        hodId !== undefined
          ? hodId === null
            ? null
            : Number(hodId)
          : existingDepartment.hodId,
    });
    
    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: updatedDepartment
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update department', 
      error: error.message 
    });
  }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if department exists
    const existingDepartment = await departmentModel.getDepartmentById(id);
    if (!existingDepartment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found' 
      });
    }
    
    await departmentModel.deleteDepartment(id);
    
    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete department', 
      error: error.message 
    });
  }
};

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
}; 