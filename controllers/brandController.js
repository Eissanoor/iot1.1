const Brand = require('../models/brand');

// Create a new brand
exports.createBrand = async (req, res) => {
  try {
    const { name, status } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    const brand = await Brand.create({
      name,
      status: status !== undefined ? status : true
    });

    res.status(201).json({
      success: true,
      data: brand,
      message: 'Brand created successfully'
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'A brand with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create brand',
      error: error.message
    });
  }
};

// Get all brands
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll();
    
    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands',
      error: error.message
    });
  }
};

// Get a single brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const brand = await Brand.findById(id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand',
      error: error.message
    });
  }
};

// Update a brand
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    
    // Check if brand exists
    const existingBrand = await Brand.findById(id);
    
    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    // Update brand
    const updatedBrand = await Brand.update(id, {
      name: name !== undefined ? name : existingBrand.name,
      status: status !== undefined ? status : existingBrand.status
    });
    
    res.status(200).json({
      success: true,
      data: updatedBrand,
      message: 'Brand updated successfully'
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'A brand with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update brand',
      error: error.message
    });
  }
};

// Delete a brand
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if brand exists
    const existingBrand = await Brand.findById(id);
    
    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }
    
    // Delete brand
    await Brand.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    
    // Handle foreign key constraint violation
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete brand as it is referenced by other records'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete brand',
      error: error.message
    });
  }
}; 