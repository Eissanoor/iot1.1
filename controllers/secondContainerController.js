const secondContainerModel = require('../models/secondContainer');
const { upload, getImageUrl } = require('../utils/uploadUtils');
const fs = require('fs');
const path = require('path');
const {createError}  = require('../utils/createError');

// Handle file upload with multer middleware
const uploadImage = upload.single('image');

// Get all SecondContainers
const getAllSecondContainers = async (req, res, next) => {
  try {
    const secondContainers = await secondContainerModel.getAllSecondContainers();
    res.status(200).json({
      success: true,
      data: secondContainers
    });
  } catch (error) {
    next(createError(500, 'Error retrieving second containers'));
  }
};

// Get SecondContainer by ID
const getSecondContainerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const secondContainer = await secondContainerModel.getSecondContainerById(id);
    
    if (!secondContainer) {
      return next(createError(404, 'Second container not found'));
    }
    
    res.status(200).json({
      success: true,
      data: secondContainer
    });
  } catch (error) {
    next(createError(500, 'Error retrieving second container'));
  }
};

// Create new SecondContainer
const createSecondContainer = async (req, res, next) => {
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
        const secondContainerData = {
          name,
          name_ar,
          description,
          description_ar,
          status: status === 'true' || status === true,
          url,
          image: req.file ? getImageUrl(req.file.filename) : null
        };
        
        const newSecondContainer = await secondContainerModel.createSecondContainer(secondContainerData);
        
        res.status(201).json({
          success: true,
          data: newSecondContainer
        });
      } catch (error) {
        // Remove uploaded file if database operation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        next(createError(500, 'Error creating second container'));
      }
    });
  } catch (error) {
    next(createError(500, 'Error processing request'));
  }
};

// Update SecondContainer
const updateSecondContainer = async (req, res, next) => {
  try {
    // Handle file upload
    uploadImage(req, res, async function(err) {
      if (err) {
        return next(createError(400, err.message));
      }
      
      try {
        const { id } = req.params;
        const { name, name_ar, description, description_ar, status, url } = req.body;
        
        // Check if SecondContainer exists
        const existingSecondContainer = await secondContainerModel.getSecondContainerById(id);
        if (!existingSecondContainer) {
          // Remove uploaded file if SecondContainer doesn't exist
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return next(createError(404, 'Second container not found'));
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
        const secondContainerData = {
          name,
          name_ar,
          description,
          description_ar,
          status: status === 'true' || status === true,
          url
        };
        
        // Handle image update
        if (req.file) {
          secondContainerData.image = getImageUrl(req.file.filename);
          
          // Delete old image if it exists
          if (existingSecondContainer.image) {
            const oldImagePath = path.join(__dirname, '..', existingSecondContainer.image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
        }
        
        const updatedSecondContainer = await secondContainerModel.updateSecondContainer(id, secondContainerData);
        
        res.status(200).json({
          success: true,
          data: updatedSecondContainer
        });
      } catch (error) {
        // Remove uploaded file if database operation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        next(createError(500, 'Error updating second container'));
      }
    });
  } catch (error) {
    next(createError(500, 'Error processing request'));
  }
};

// Delete SecondContainer
const deleteSecondContainer = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if SecondContainer exists
    const existingSecondContainer = await secondContainerModel.getSecondContainerById(id);
    if (!existingSecondContainer) {
      return next(createError(404, 'Second container not found'));
    }
    
    // Delete the SecondContainer
    await secondContainerModel.deleteSecondContainer(id);
    
    // Delete associated image if it exists
    if (existingSecondContainer.image) {
      const imagePath = path.join(__dirname, '..', existingSecondContainer.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Second container deleted successfully'
    });
  } catch (error) {
    next(createError(500, 'Error deleting second container'));
  }
};

// Update SecondContainer Status
const updateSecondContainerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status === undefined) {
      return next(createError(400, 'Status is required'));
    }
    
    // Check if SecondContainer exists
    const existingSecondContainer = await secondContainerModel.getSecondContainerById(id);
    if (!existingSecondContainer) {
      return next(createError(404, 'Second container not found'));
    }
    
    const boolStatus = status === 'true' || status === true;
    const updatedSecondContainer = await secondContainerModel.updateSecondContainerStatus(id, boolStatus);
    
    res.status(200).json({
      success: true,
      data: updatedSecondContainer
    });
  } catch (error) {
    next(createError(500, 'Error updating second container status'));
  }
};

module.exports = {
  getAllSecondContainers,
  getSecondContainerById,
  createSecondContainer,
  updateSecondContainer,
  deleteSecondContainer,
  updateSecondContainerStatus
};
