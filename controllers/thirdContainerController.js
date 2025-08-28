const thirdContainerModel = require('../models/thirdContainer');
const { upload, getImageUrl } = require('../utils/uploadUtils');
const fs = require('fs');
const path = require('path');
const {createError} = require('../utils/createError');

// Handle file upload with multer middleware
const uploadImage = upload.single('image');

// Get all ThirdContainers
const getAllThirdContainers = async (req, res, next) => {
  try {
    const thirdContainers = await thirdContainerModel.getAllThirdContainers();
    res.status(200).json({
      success: true,
      data: thirdContainers
    });
  } catch (error) {
    next(createError(500, 'Error retrieving third containers'));
  }
};

// Get ThirdContainer by ID
const getThirdContainerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const thirdContainer = await thirdContainerModel.getThirdContainerById(id);
    
    if (!thirdContainer) {
      return next(createError(404, 'Third container not found'));
    }
    
    res.status(200).json({
      success: true,
      data: thirdContainer
    });
  } catch (error) {
    next(createError(500, 'Error retrieving third container'));
  }
};

// Create new ThirdContainer
const createThirdContainer = async (req, res, next) => {
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
        const thirdContainerData = {
          name,
          name_ar,
          description,
          description_ar,
          status: status === 'true' || status === true,
          url,
          image: req.file ? getImageUrl(req.file.filename) : null
        };
        
        const newThirdContainer = await thirdContainerModel.createThirdContainer(thirdContainerData);
        
        res.status(201).json({
          success: true,
          data: newThirdContainer
        });
      } catch (error) {
        // Remove uploaded file if database operation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        next(createError(500, 'Error creating third container'));
      }
    });
  } catch (error) {
    next(createError(500, 'Error processing request'));
  }
};

// Update ThirdContainer
const updateThirdContainer = async (req, res, next) => {
  try {
    // Handle file upload
    uploadImage(req, res, async function(err) {
      if (err) {
        return next(createError(400, err.message));
      }
      
      try {
        const { id } = req.params;
        const { name, name_ar, description, description_ar, status, url } = req.body;
        
        // Check if ThirdContainer exists
        const existingThirdContainer = await thirdContainerModel.getThirdContainerById(id);
        if (!existingThirdContainer) {
          // Remove uploaded file if ThirdContainer doesn't exist
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return next(createError(404, 'Third container not found'));
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
        const thirdContainerData = {
          name,
          name_ar,
          description,
          description_ar,
          status: status === 'true' || status === true,
          url
        };
        
        // Handle image update
        if (req.file) {
          thirdContainerData.image = getImageUrl(req.file.filename);
          
          // Delete old image if it exists
          if (existingThirdContainer.image) {
            const oldImagePath = path.join(__dirname, '..', existingThirdContainer.image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
        }
        
        const updatedThirdContainer = await thirdContainerModel.updateThirdContainer(id, thirdContainerData);
        
        res.status(200).json({
          success: true,
          data: updatedThirdContainer
        });
      } catch (error) {
        // Remove uploaded file if database operation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        next(createError(500, 'Error updating third container'));
      }
    });
  } catch (error) {
    next(createError(500, 'Error processing request'));
  }
};

// Delete ThirdContainer
const deleteThirdContainer = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if ThirdContainer exists
    const existingThirdContainer = await thirdContainerModel.getThirdContainerById(id);
    if (!existingThirdContainer) {
      return next(createError(404, 'Third container not found'));
    }
    
    // Delete the ThirdContainer
    await thirdContainerModel.deleteThirdContainer(id);
    
    // Delete associated image if it exists
    if (existingThirdContainer.image) {
      const imagePath = path.join(__dirname, '..', existingThirdContainer.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Third container deleted successfully'
    });
  } catch (error) {
    next(createError(500, 'Error deleting third container'));
  }
};

// Update ThirdContainer Status
const updateThirdContainerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status === undefined) {
      return next(createError(400, 'Status is required'));
    }
    
    // Check if ThirdContainer exists
    const existingThirdContainer = await thirdContainerModel.getThirdContainerById(id);
    if (!existingThirdContainer) {
      return next(createError(404, 'Third container not found'));
    }
    
    const boolStatus = status === 'true' || status === true;
    const updatedThirdContainer = await thirdContainerModel.updateThirdContainerStatus(id, boolStatus);
    
    res.status(200).json({
      success: true,
      data: updatedThirdContainer
    });
  } catch (error) {
    next(createError(500, 'Error updating third container status'));
  }
};

module.exports = {
  getAllThirdContainers,
  getThirdContainerById,
  createThirdContainer,
  updateThirdContainer,
  deleteThirdContainer,
  updateThirdContainerStatus
};
