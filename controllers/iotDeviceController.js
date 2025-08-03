const prisma = require('../prisma/client');
const { upload, getImageUrl } = require('../utils/uploadUtils');

// Middleware for handling file uploads
exports.uploadIotDeviceImage = upload.single('image');

// Controller methods for IotDevice CRUD operations
exports.createIotDevice = async (req, res) => {
  try {
    const { 
      name, 
      tagNumber, 
      model, 
      serialNumber, 
      price,
      modifiers,
      manufactureDate,
      expiryDate,
      status,
      deviceCategoryId
    } = req.body;
    
    // Validate required fields
    if (!name || !tagNumber || !model || !deviceCategoryId) {
      return res.status(400).json({ 
        error: 'Required fields missing: name, tagNumber, model, and deviceCategoryId are required' 
      });
    }
    
    // Check if device category exists
    const deviceCategory = await prisma.deviceCategory.findUnique({
      where: { id: parseInt(deviceCategoryId) }
    });
    
    if (!deviceCategory) {
      return res.status(404).json({ error: 'Device category not found' });
    }
    
    // Check if device with the same tag number already exists
    const existingDevice = await prisma.iotDevice.findUnique({
      where: { tagNumber }
    });
    
    if (existingDevice) {
      return res.status(409).json({ error: 'Device with this tag number already exists' });
    }
    
    // Process image if uploaded
    let imagePath = null;
    if (req.file) {
      imagePath = getImageUrl(req.file.filename);
    }
    
    // Parse dates if provided
    const parsedManufactureDate = manufactureDate ? new Date(manufactureDate) : null;
    const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null;
    
    // Create new IoT device
    const iotDevice = await prisma.iotDevice.create({
      data: {
        name,
        tagNumber,
        model,
        serialNumber: serialNumber || null,
        image: imagePath,
        price: price ? parseFloat(price) : null,
        modifiers: modifiers || null,
        manufactureDate: parsedManufactureDate,
        expiryDate: parsedExpiryDate,
        status: status !== undefined ? parseInt(status) : 0,
        deviceCategoryId: parseInt(deviceCategoryId)
      }
    });
    
    res.status(201).json(iotDevice);
  } catch (error) {
    console.error('Error creating IoT device:', error);
    res.status(500).json({ error: 'Failed to create IoT device' });
  }
};

exports.getAllIotDevices = async (req, res) => {
  try {
    const iotDevices = await prisma.iotDevice.findMany({
      include: {
        deviceCategory: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json(iotDevices);
  } catch (error) {
    console.error('Error fetching IoT devices:', error);
    res.status(500).json({ error: 'Failed to fetch IoT devices' });
  }
};

exports.getIotDeviceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const iotDevice = await prisma.iotDevice.findUnique({
      where: { id: parseInt(id) },
      include: {
        deviceCategory: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!iotDevice) {
      return res.status(404).json({ error: 'IoT device not found' });
    }
    
    res.status(200).json(iotDevice);
  } catch (error) {
    console.error('Error fetching IoT device:', error);
    res.status(500).json({ error: 'Failed to fetch IoT device' });
  }
};

exports.updateIotDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      tagNumber, 
      model, 
      serialNumber, 
      price,
      modifiers,
      manufactureDate,
      expiryDate,
      status,
      deviceCategoryId
    } = req.body;
    
    // Check if IoT device exists
    const existingDevice = await prisma.iotDevice.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingDevice) {
      return res.status(404).json({ error: 'IoT device not found' });
    }
    
    // If tag number is being changed, check if the new tag number already exists
    if (tagNumber && tagNumber !== existingDevice.tagNumber) {
      const tagExists = await prisma.iotDevice.findUnique({
        where: { tagNumber }
      });
      
      if (tagExists) {
        return res.status(409).json({ error: 'Device with this tag number already exists' });
      }
    }
    
    // If device category is provided, check if it exists
    if (deviceCategoryId) {
      const deviceCategory = await prisma.deviceCategory.findUnique({
        where: { id: parseInt(deviceCategoryId) }
      });
      
      if (!deviceCategory) {
        return res.status(404).json({ error: 'Device category not found' });
      }
    }
    
    // Process image if uploaded
    let imagePath = existingDevice.image;
    if (req.file) {
      imagePath = getImageUrl(req.file.filename);
    }
    
    // Parse dates if provided
    const parsedManufactureDate = manufactureDate ? new Date(manufactureDate) : existingDevice.manufactureDate;
    const parsedExpiryDate = expiryDate ? new Date(expiryDate) : existingDevice.expiryDate;
    
    // Update IoT device
    const updatedDevice = await prisma.iotDevice.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingDevice.name,
        tagNumber: tagNumber || existingDevice.tagNumber,
        model: model || existingDevice.model,
        serialNumber: serialNumber !== undefined ? serialNumber : existingDevice.serialNumber,
        image: imagePath,
        price: price !== undefined ? parseFloat(price) : existingDevice.price,
        modifiers: modifiers !== undefined ? modifiers : existingDevice.modifiers,
        manufactureDate: parsedManufactureDate,
        expiryDate: parsedExpiryDate,
        status: status !== undefined ? parseInt(status) : existingDevice.status,
        deviceCategoryId: deviceCategoryId ? parseInt(deviceCategoryId) : existingDevice.deviceCategoryId
      }
    });
    
    res.status(200).json(updatedDevice);
  } catch (error) {
    console.error('Error updating IoT device:', error);
    res.status(500).json({ error: 'Failed to update IoT device' });
  }
};

exports.deleteIotDevice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if IoT device exists
    const existingDevice = await prisma.iotDevice.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingDevice) {
      return res.status(404).json({ error: 'IoT device not found' });
    }
    
    // Delete IoT device
    await prisma.iotDevice.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'IoT device deleted successfully' });
  } catch (error) {
    console.error('Error deleting IoT device:', error);
    res.status(500).json({ error: 'Failed to delete IoT device' });
  }
};