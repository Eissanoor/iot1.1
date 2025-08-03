const prisma = require('../prisma/client');
const { upload, getImageUrl } = require('../utils/uploadUtils');

// Middleware for handling file uploads
exports.uploadDeviceCategoryImage = upload.single('image');

// Controller methods for DeviceCategory CRUD operations
exports.createDeviceCategory = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      button
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        error: 'Required field missing: name is required' 
      });
    }
    
    // Check if category with the same name already exists
    const existingCategory = await prisma.deviceCategory.findUnique({
      where: { name }
    });
    
    if (existingCategory) {
      return res.status(409).json({ error: 'Device category with this name already exists' });
    }
    
    // Process image if uploaded
    let imagePath = null;
    if (req.file) {
      imagePath = getImageUrl(req.file.filename);
    }
    
    // Create new device category
    const deviceCategory = await prisma.deviceCategory.create({
      data: {
        name,
        description: description || null,
        image: imagePath,
        button: button || null
      }
    });
    
    res.status(201).json(deviceCategory);
  } catch (error) {
    console.error('Error creating device category:', error);
    res.status(500).json({ error: 'Failed to create device category' });
  }
};

exports.getAllDeviceCategories = async (req, res) => {
  try {
    const deviceCategories = await prisma.deviceCategory.findMany({
      include: {
        _count: {
          select: { iotDevices: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format the response to include device count
    const formattedCategories = deviceCategories.map(category => ({
      ...category,
      deviceCount: category._count.iotDevices,
      _count: undefined
    }));
    
    res.status(200).json(formattedCategories);
  } catch (error) {
    console.error('Error fetching device categories:', error);
    res.status(500).json({ error: 'Failed to fetch device categories' });
  }
};

exports.getDeviceCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deviceCategory = await prisma.deviceCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        iotDevices: true,
        _count: {
          select: { iotDevices: true }
        }
      }
    });
    
    if (!deviceCategory) {
      return res.status(404).json({ error: 'Device category not found' });
    }
    
    // Format the response
    const formattedCategory = {
      ...deviceCategory,
      deviceCount: deviceCategory._count.iotDevices,
      _count: undefined
    };
    
    res.status(200).json(formattedCategory);
  } catch (error) {
    console.error('Error fetching device category:', error);
    res.status(500).json({ error: 'Failed to fetch device category' });
  }
};

exports.updateDeviceCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      button 
    } = req.body;
    
    // Check if device category exists
    const existingCategory = await prisma.deviceCategory.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingCategory) {
      return res.status(404).json({ error: 'Device category not found' });
    }
    
    // If name is being changed, check if the new name already exists
    if (name && name !== existingCategory.name) {
      const nameExists = await prisma.deviceCategory.findUnique({
        where: { name }
      });
      
      if (nameExists) {
        return res.status(409).json({ error: 'Device category with this name already exists' });
      }
    }
    
    // Process image if uploaded
    let imagePath = existingCategory.image;
    if (req.file) {
      imagePath = getImageUrl(req.file.filename);
    }
    
    // Update device category
    const updatedCategory = await prisma.deviceCategory.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingCategory.name,
        description: description !== undefined ? description : existingCategory.description,
        image: imagePath,
        button: button !== undefined ? button : existingCategory.button
      }
    });
    
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating device category:', error);
    res.status(500).json({ error: 'Failed to update device category' });
  }
};

exports.deleteDeviceCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if device category exists
    const existingCategory = await prisma.deviceCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { iotDevices: true }
        }
      }
    });
    
    if (!existingCategory) {
      return res.status(404).json({ error: 'Device category not found' });
    }
    
    // Check if category has associated devices
    if (existingCategory._count.iotDevices > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with associated devices. Please remove or reassign devices first.' 
      });
    }
    
    // Delete device category
    await prisma.deviceCategory.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Device category deleted successfully' });
  } catch (error) {
    console.error('Error deleting device category:', error);
    res.status(500).json({ error: 'Failed to delete device category' });
  }
};