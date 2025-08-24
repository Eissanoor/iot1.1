const firstContainerModel = require('../models/firstContainer');
const { upload, getImageUrl } = require('../utils/uploadUtils');
const fs = require('fs');
const path = require('path');
const createError = require('../utils/createError');

// Handle file upload with multer middleware
const uploadImage = upload.single('image');

// Get all FirstContainers
const getAllFirstContainers = async (req, res, next) => {
  try {
    const firstContainers = await firstContainerModel.getAllFirstContainers();
    res.status(200).json({
      success: true,
      data: firstContainers
    });
  } catch (error) {
    next(createError(500, 'Error retrieving first containers'));
  }
};

// Get FirstContainer by ID
const getFirstContainerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const firstContainer = await firstContainerModel.getFirstContainerById(id);
    
    if (!firstContainer) {
      return next(createError(404, 'First container not found'));
    }
    
    res.status(200).json({
      success: true,
      data: firstContainer
    });
  } catch (error) {
    next(createError(500, 'Error retrieving first container'));
  }
};

// Create new FirstContainer
const createFirstContainer = async (req, res, next) => {
  try {
    // Handle file upload
    uploadImage(req, res, async function(err) {
      if (err) {
        return next(createError(400, err.message));
      }
      
      try {
        const { name, name_ar, description, description_ar, status, url } = req.body;
        
        // Validate required fields
        if (!name || !name_ar) {
          // Remove uploaded file if validation fails
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return next(createError(400, 'Name and name_ar are required fields'));
        }
        
        // Prepare data for database
        const firstContainerData = {
          name,
          name_ar,
          description,
          description_ar,
          status: status === 'true' || status === true,
          url,
          image: req.file ? getImageUrl(req.file.filename) : null
        };
        
        const newFirstContainer = await firstContainerModel.createFirstContainer(firstContainerData);
        
        res.status(201).json({
          success: true,
          data: newFirstContainer
        });
      } catch (error) {
        // Remove uploaded file if database operation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        next(createError(500, 'Error creating first container'));
      }
    });
  } catch (error) {
    next(createError(500, 'Error processing request'));
  }
};

// Update FirstContainer
const updateFirstContainer = async (req, res, next) => {
  try {
    // Handle file upload
    uploadImage(req, res, async function(err) {
      if (err) {
        return next(createError(400, err.message));
      }
      
      try {
        const { id } = req.params;
        const { name, name_ar, description, description_ar, status, url } = req.body;
        
        // Check if FirstContainer exists
        const existingFirstContainer = await firstContainerModel.getFirstContainerById(id);
        if (!existingFirstContainer) {
          // Remove uploaded file if FirstContainer doesn't exist
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return next(createError(404, 'First container not found'));
        }
        
        // Validate required fields
        if (!name || !name_ar) {
          // Remove uploaded file if validation fails
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return next(createError(400, 'Name and name_ar are required fields'));
        }
        
        // Prepare data for database
        const firstContainerData = {
          name,
          name_ar,
          description,
          description_ar,
          status: status === 'true' || status === true,
          url
        };
        
        // Handle image update
        if (req.file) {
          firstContainerData.image = getImageUrl(req.file.filename);
          
          // Delete old image if it exists
          if (existingFirstContainer.image) {
            const oldImagePath = path.join(__dirname, '..', existingFirstContainer.image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
        }
        
        const updatedFirstContainer = await firstContainerModel.updateFirstContainer(id, firstContainerData);
        
        res.status(200).json({
          success: true,
          data: updatedFirstContainer
        });
      } catch (error) {
        // Remove uploaded file if database operation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        next(createError(500, 'Error updating first container'));
      }
    });
  } catch (error) {
    next(createError(500, 'Error processing request'));
  }
};

// Delete FirstContainer
const deleteFirstContainer = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if FirstContainer exists
    const existingFirstContainer = await firstContainerModel.getFirstContainerById(id);
    if (!existingFirstContainer) {
      return next(createError(404, 'First container not found'));
    }
    
    // Delete the FirstContainer
    await firstContainerModel.deleteFirstContainer(id);
    
    // Delete associated image if it exists
    if (existingFirstContainer.image) {
      const imagePath = path.join(__dirname, '..', existingFirstContainer.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'First container deleted successfully'
    });
  } catch (error) {
    next(createError(500, 'Error deleting first container'));
  }
};

// Update FirstContainer Status
const updateFirstContainerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status === undefined) {
      return next(createError(400, 'Status is required'));
    }
    
    // Check if FirstContainer exists
    const existingFirstContainer = await firstContainerModel.getFirstContainerById(id);
    if (!existingFirstContainer) {
      return next(createError(404, 'First container not found'));
    }
    
    const boolStatus = status === 'true' || status === true;
    const updatedFirstContainer = await firstContainerModel.updateFirstContainerStatus(id, boolStatus);
    
    res.status(200).json({
      success: true,
      data: updatedFirstContainer
    });
  } catch (error) {
    next(createError(500, 'Error updating first container status'));
  }
};

module.exports = {
  getAllFirstContainers,
  getFirstContainerById,
  createFirstContainer,
  updateFirstContainer,
  deleteFirstContainer,
  updateFirstContainerStatus
};
