const AssetBrand = require('../models/assetBrand');
const { getImageUrl } = require('../utils/uploadUtils');

// Create a new AssetBrand
exports.createAssetBrand = async (req, res) => {
  try {
    const {
      name,
      status,
      category,
      supplier,
      website,
      contactInformation,
      relaibiblityScore,
      description,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const logo = req.file ? getImageUrl(req.file.filename) : null;

    const assetBrand = await AssetBrand.create({
      name,
      status: status !== undefined ? status : true,
      logo,
      category,
      supplier,
      website,
      contactInformation,
      relaibiblityScore:
        relaibiblityScore !== undefined ? Number(relaibiblityScore) : null,
      description,
    });

    res.status(201).json({
      success: true,
      data: assetBrand,
      message: 'Asset brand created successfully',
    });
  } catch (error) {
    console.error('Error creating asset brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create asset brand',
      error: error.message,
    });
  }
};

// Get all AssetBrands
exports.getAllAssetBrands = async (req, res) => {
  try {
    const assetBrands = await AssetBrand.findAll();

    res.status(200).json({
      success: true,
      count: assetBrands.length,
      data: assetBrands,
    });
  } catch (error) {
    console.error('Error fetching asset brands:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset brands',
      error: error.message,
    });
  }
};

// Get single AssetBrand by ID
exports.getAssetBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const assetBrand = await AssetBrand.findById(id);

    if (!assetBrand) {
      return res.status(404).json({
        success: false,
        message: 'Asset brand not found',
      });
    }

    res.status(200).json({
      success: true,
      data: assetBrand,
    });
  } catch (error) {
    console.error('Error fetching asset brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset brand',
      error: error.message,
    });
  }
};

// Update AssetBrand
exports.updateAssetBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      status,
      category,
      supplier,
      website,
      contactInformation,
      relaibiblityScore,
      description,
    } = req.body;

    const existing = await AssetBrand.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Asset brand not found',
      });
    }

    const logo =
      req.file && req.file.filename
        ? getImageUrl(req.file.filename)
        : undefined;

    const updated = await AssetBrand.update(id, {
      name: name !== undefined ? name : existing.name,
      status: status !== undefined ? status : existing.status,
      logo: logo !== undefined ? logo : existing.logo,
      category: category !== undefined ? category : existing.category,
      supplier: supplier !== undefined ? supplier : existing.supplier,
      website: website !== undefined ? website : existing.website,
      contactInformation:
        contactInformation !== undefined
          ? contactInformation
          : existing.contactInformation,
      relaibiblityScore:
        relaibiblityScore !== undefined
          ? Number(relaibiblityScore)
          : existing.relaibiblityScore,
      description: description !== undefined ? description : existing.description,
    });

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Asset brand updated successfully',
    });
  } catch (error) {
    console.error('Error updating asset brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update asset brand',
      error: error.message,
    });
  }
};

// Delete AssetBrand
exports.deleteAssetBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await AssetBrand.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Asset brand not found',
      });
    }

    await AssetBrand.delete(id);

    res.status(200).json({
      success: true,
      message: 'Asset brand deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting asset brand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete asset brand',
      error: error.message,
    });
  }
};


