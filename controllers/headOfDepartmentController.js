const headOfDepartmentModel = require('../models/headOfDepartment');

// Create a new head of department
const createHeadOfDepartment = async (req, res) => {
  try {
    const { name, phoneNo, email } = req.body;
    
    // Check if required fields are provided
    if (!name || !phoneNo || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, phone number, and email are required' 
      });
    }
    
    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }
    
    const headOfDepartment = await headOfDepartmentModel.createHeadOfDepartment({
      name,
      phoneNo,
      email,
    });
    
    res.status(201).json({
      success: true,
      message: 'Head of Department created successfully',
      data: headOfDepartment
    });
  } catch (error) {
    console.error('Error creating head of department:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create head of department', 
      error: error.message 
    });
  }
};

// Get all heads of department with pagination
const getAllHeadsOfDepartment = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await headOfDepartmentModel.getAllHeadsOfDepartment(page, limit);
    
    res.status(200).json({
      success: true,
      message: 'Heads of Department retrieved successfully',
      data: result.heads,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error retrieving heads of department:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve heads of department', 
      error: error.message 
    });
  }
};

// Get head of department by ID
const getHeadOfDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const headOfDepartment = await headOfDepartmentModel.getHeadOfDepartmentById(id);
    
    if (!headOfDepartment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Head of Department not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Head of Department retrieved successfully',
      data: headOfDepartment
    });
  } catch (error) {
    console.error('Error retrieving head of department:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve head of department', 
      error: error.message 
    });
  }
};

// Update head of department
const updateHeadOfDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNo, email } = req.body;
    
    // Check if head of department exists
    const existingHead = await headOfDepartmentModel.getHeadOfDepartmentById(id);
    if (!existingHead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Head of Department not found' 
      });
    }
    
    // Validate email format if email is being updated
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format' 
        });
      }
    }
    
    const updatedHead = await headOfDepartmentModel.updateHeadOfDepartment(id, {
      name: name || existingHead.name,
      phoneNo: phoneNo || existingHead.phoneNo,
      email: email || existingHead.email,
    });
    
    res.status(200).json({
      success: true,
      message: 'Head of Department updated successfully',
      data: updatedHead
    });
  } catch (error) {
    console.error('Error updating head of department:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update head of department', 
      error: error.message 
    });
  }
};

// Delete head of department
const deleteHeadOfDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if head of department exists
    const existingHead = await headOfDepartmentModel.getHeadOfDepartmentById(id);
    if (!existingHead) {
      return res.status(404).json({ 
        success: false, 
        message: 'Head of Department not found' 
      });
    }
    
    // Check if head is assigned to any departments
    if (existingHead.departments && existingHead.departments.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete head of department that is assigned to one or more departments. Please reassign departments first.' 
      });
    }
    
    await headOfDepartmentModel.deleteHeadOfDepartment(id);
    
    res.status(200).json({
      success: true,
      message: 'Head of Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting head of department:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete head of department', 
      error: error.message 
    });
  }
};

module.exports = {
  createHeadOfDepartment,
  getAllHeadsOfDepartment,
  getHeadOfDepartmentById,
  updateHeadOfDepartment,
  deleteHeadOfDepartment
};

