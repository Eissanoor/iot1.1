const SubCategory = require('../models/subCategory');
const Category = require('../models/category');

// Get all subcategories
exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll();
    res.status(200).json({ subCategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get subcategories by category ID
exports.getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const subCategories = await SubCategory.findByCategoryId(categoryId);
    res.status(200).json({ subCategories });
  } catch (error) {
    console.error('Error fetching subcategories by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single subcategory by ID
exports.getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    
    res.status(200).json({ subCategory });
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new subcategory
exports.createSubCategory = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;
    
    // Validate input
    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Subcategory name and category ID are required' });
    }
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Parent category not found' });
    }
    
    // Check if subcategory with the same name already exists in this category
    const existingSubCategory = await SubCategory.findByNameAndCategory(name, categoryId);
    if (existingSubCategory) {
      return res.status(400).json({ error: 'Subcategory with this name already exists in the selected category' });
    }
    
    // Create new subcategory
    const subCategory = await SubCategory.create({
      name,
      description,
      categoryId: Number(categoryId)
    });
    
    res.status(201).json({
      message: 'Subcategory created successfully',
      subCategory
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a subcategory
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, categoryId } = req.body;
    
    // Check if subcategory exists
    const existingSubCategory = await SubCategory.findById(id);
    if (!existingSubCategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    
    // If category is being changed, check if it exists
    if (categoryId && Number(categoryId) !== existingSubCategory.categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Parent category not found' });
      }
    }
    
    // If name or category is being updated, check for uniqueness
    if ((name && name !== existingSubCategory.name) || 
        (categoryId && Number(categoryId) !== existingSubCategory.categoryId)) {
      const targetCategoryId = categoryId ? Number(categoryId) : existingSubCategory.categoryId;
      const targetName = name || existingSubCategory.name;
      
      const subCategoryWithSameName = await SubCategory.findByNameAndCategory(targetName, targetCategoryId);
      if (subCategoryWithSameName && subCategoryWithSameName.id !== Number(id)) {
        return res.status(400).json({ error: 'Subcategory with this name already exists in the selected category' });
      }
    }
    
    // Update subcategory
    const updatedSubCategory = await SubCategory.updateById(id, {
      name: name || existingSubCategory.name,
      description: description !== undefined ? description : existingSubCategory.description,
      categoryId: categoryId ? Number(categoryId) : existingSubCategory.categoryId
    });
    
    res.status(200).json({
      message: 'Subcategory updated successfully',
      subCategory: updatedSubCategory
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a subcategory
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if subcategory exists
    const existingSubCategory = await SubCategory.findById(id);
    if (!existingSubCategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    
    // Delete subcategory
    await SubCategory.deleteById(id);
    
    res.status(200).json({
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 