const Category = require('../models/category');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.status(200).json({ category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category with the same name already exists
    const existingCategory = await Category.findByName(name);
    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    
    // Create new category
    const category = await Category.create({
      name,
      description
    });
    
    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // If name is being updated, check if it's unique
    if (name && name !== existingCategory.name) {
      const categoryWithSameName = await Category.findByName(name);
      if (categoryWithSameName) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
    }
    
    // Update category
    const updatedCategory = await Category.updateById(id, {
      name: name || existingCategory.name,
      description: description !== undefined ? description : existingCategory.description
    });
    
    res.status(200).json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Delete category
    await Category.deleteById(id);
    
    res.status(200).json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    
    // Check if error is due to foreign key constraint (subcategories exist)
    if (error.code === 'P2003' || error.message.includes('foreign key constraint')) {
      return res.status(400).json({ 
        error: 'Cannot delete category because it has subcategories. Delete the subcategories first.' 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}; 