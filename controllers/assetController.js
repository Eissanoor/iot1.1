const prisma = require('../prisma/client');

// Controller methods for Asset CRUD operations
exports.createAsset = async (req, res) => {
  try {
    const { name, model, description } = req.body;
    
    // Validate required fields
    if (!name || !model) {
      return res.status(400).json({ error: 'Name and model are required fields' });
    }
    
    // Create new asset
    const asset = await prisma.asset.create({
      data: {
        name,
        model,
        description: description || ''
      }
    });
    
    res.status(201).json({ 
      message: 'Asset created successfully',
      asset
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllAssets = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const limit = parseInt(req.query.limit) || 100; // Default to 100 records
    const skip = parseInt(req.query.skip) || 0;
    
    // Get assets with pagination, sort by createdAt descending (newest first)
    const assets = await prisma.asset.findMany({
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    // Get total count
    const count = await prisma.asset.count();
    
    res.status(200).json({
      count,
      assets
    });
  } catch (error) {
    console.error('Error retrieving assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find asset by ID
    const asset = await prisma.asset.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.status(200).json(asset);
  } catch (error) {
    console.error('Error retrieving asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, model, description } = req.body;
    
    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Update asset
    const updatedAsset = await prisma.asset.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : existingAsset.name,
        model: model !== undefined ? model : existingAsset.model,
        description: description !== undefined ? description : existingAsset.description
      }
    });
    
    res.status(200).json({
      message: 'Asset updated successfully',
      asset: updatedAsset
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if asset exists
    const existingAsset = await prisma.asset.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Delete asset
    await prisma.asset.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 