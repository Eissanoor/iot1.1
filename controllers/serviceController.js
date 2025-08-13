const serviceModel = require('../models/service');
const { getImageUrl } = require('../utils/uploadUtils');
const fs = require('fs');
const path = require('path');

// Create a new service
const createService = async (req, res) => {
  try {
    const serviceData = req.body;
    
    // Handle both camelCase and snake_case field names
    const name = serviceData.name;
    const displayName = serviceData.displayName || serviceData.display_name;
    const description = serviceData.description;
    const serviceType = serviceData.serviceType || serviceData.service_type;
    const isActive = serviceData.isActive || serviceData.is_active;
    
    console.log('Request body:', req.body);
    
    // Validate required fields
    if (!name || !displayName) {
      return res.status(400).json({ message: 'Name and displayName are required fields' });
    }
    
    // Check if service with the same name already exists
    const existingService = await serviceModel.getServiceByName(name);
    if (existingService) {
      return res.status(400).json({ message: 'Service with this name already exists' });
    }
    
    // Prepare data in camelCase format
    const normalizedData = {
      name,
      displayName,
      description,
      serviceType,
      isActive: isActive !== undefined ? isActive : true
    };
    
    // Handle file upload if present
    if (req.file) {
      normalizedData.icon = req.file.filename;
    }
    
    const service = await serviceModel.createService(normalizedData);
    
    // Add full URL for icon if present
    if (service.icon) {
      service.iconUrl = getImageUrl(service.icon);
    }
    
    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({ message: 'Failed to create service', error: error.message });
  }
};

// Get all services
const getAllServices = async (req, res) => {
  try {
    const services = await serviceModel.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Failed to fetch services', error: error.message });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await serviceModel.getServiceById(id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.status(200).json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Failed to fetch service', error: error.message });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;
    
    console.log('Update request body:', req.body);
    
    // Check if service exists
    const existingService = await serviceModel.getServiceById(id);
    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Handle both camelCase and snake_case field names
    const normalizedData = {};
    
    if (serviceData.name !== undefined) normalizedData.name = serviceData.name;
    if (serviceData.displayName !== undefined || serviceData.display_name !== undefined) 
      normalizedData.displayName = serviceData.displayName || serviceData.display_name;
    if (serviceData.description !== undefined) normalizedData.description = serviceData.description;
    if (serviceData.serviceType !== undefined || serviceData.service_type !== undefined) 
      normalizedData.serviceType = serviceData.serviceType || serviceData.service_type;
    if (serviceData.isActive !== undefined || serviceData.is_active !== undefined) 
      normalizedData.isActive = serviceData.isActive !== undefined ? serviceData.isActive : serviceData.is_active;
    
    // If name is being updated, check if it conflicts with another service
    if (normalizedData.name && normalizedData.name !== existingService.name) {
      const nameExists = await serviceModel.getServiceByName(normalizedData.name);
      if (nameExists && nameExists.id !== id) {
        return res.status(400).json({ message: 'Service with this name already exists' });
      }
    }
    
    // Handle file upload if present
    if (req.file) {
      // Delete old icon file if it exists
      if (existingService.icon) {
        const oldFilePath = path.join(__dirname, '../uploads', existingService.icon);
        fs.unlink(oldFilePath, (err) => {
          if (err && err.code !== 'ENOENT') console.error('Error deleting old file:', err);
        });
      }
      
      // Set new icon filename
      normalizedData.icon = req.file.filename;
    }
    
    const updatedService = await serviceModel.updateService(id, normalizedData);
    
    // Add full URL for icon if present
    if (updatedService.icon) {
      updatedService.iconUrl = getImageUrl(updatedService.icon);
    }
    
    res.status(200).json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({ message: 'Failed to update service', error: error.message });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if service exists
    const existingService = await serviceModel.getServiceById(id);
    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Delete icon file if it exists
    if (existingService.icon) {
      const filePath = path.join(__dirname, '../uploads', existingService.icon);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error deleting file:', err);
      });
    }
    
    await serviceModel.deleteService(id);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Failed to delete service', error: error.message });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
};