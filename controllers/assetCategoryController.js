const AssetCategory = require('../models/assetCategory');

// Create a new AssetCategory
exports.createAssetCategory = async (req, res) => {
  try {
    const {
      name,
      status,
      description,
      defultDepartment,
      mantenanceInterval,
      categoryIcon,
    } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: 'Name is required' });
    }

    const assetCategory = await AssetCategory.create({
      name,
      status: status !== undefined ? status : true,
      description,
      defultDepartment,
      mantenanceInterval,
      categoryIcon,
    });

    res.status(201).json({
      success: true,
      data: assetCategory,
      message: 'Asset category created successfully',
    });
  } catch (error) {
    console.error('Error creating asset category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create asset category',
      error: error.message,
    });
  }
};

// Get all AssetCategories
exports.getAllAssetCategories = async (req, res) => {
  try {
    const assetCategories = await AssetCategory.findAll();

    res.status(200).json({
      success: true,
      count: assetCategories.length,
      data: assetCategories,
    });
  } catch (error) {
    console.error('Error fetching asset categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset categories',
      error: error.message,
    });
  }
};

// Get single AssetCategory by ID
exports.getAssetCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const assetCategory = await AssetCategory.findById(id);

    if (!assetCategory) {
      return res.status(404).json({
        success: false,
        message: 'Asset category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: assetCategory,
    });
  } catch (error) {
    console.error('Error fetching asset category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset category',
      error: error.message,
    });
  }
};

// Update AssetCategory
exports.updateAssetCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      status,
      description,
      defultDepartment,
      mantenanceInterval,
      categoryIcon,
    } = req.body;

    const existing = await AssetCategory.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Asset category not found',
      });
    }

    const updated = await AssetCategory.update(id, {
      name: name !== undefined ? name : existing.name,
      status: status !== undefined ? status : existing.status,
      description:
        description !== undefined ? description : existing.description,
      defultDepartment:
        defultDepartment !== undefined
          ? defultDepartment
          : existing.defultDepartment,
      mantenanceInterval:
        mantenanceInterval !== undefined
          ? mantenanceInterval
          : existing.mantenanceInterval,
      categoryIcon:
        categoryIcon !== undefined ? categoryIcon : existing.categoryIcon,
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Asset category updated successfully',
    });
  } catch (error) {
    console.error('Error updating asset category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update asset category',
      error: error.message,
    });
  }
};

// Delete AssetCategory
exports.deleteAssetCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await AssetCategory.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Asset category not found',
      });
    }

    await AssetCategory.delete(id);

    res.status(200).json({
      success: true,
      message: 'Asset category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting asset category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete asset category',
      error: error.message,
    });
  }
};


