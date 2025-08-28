const fourthContainerModel = require('../models/fourthContainer');
const { upload, getImageUrl } = require('../utils/uploadUtils');
const fs = require('fs');
const path = require('path');
const {createError} = require('../utils/createError');

// Handle file upload with multer middleware
const uploadImage = upload.single('image');

// Get all FourthContainers
const getAllFourthContainers = async (req, res, next) => {
  try {
    const fourthContainers = await fourthContainerModel.getAllFourthContainers();
    
    // Parse points from JSON string to array for each container
    const containersWithParsedPoints = fourthContainers.map(container => {
      return {
        ...container,
        points: JSON.parse(container.points || '[]')
      };
    });
    
    res.status(200).json({
      success: true,
      data: containersWithParsedPoints
    });
  } catch (error) {
    next(createError(500, 'Error retrieving fourth containers'));
  }
};

// Get FourthContainer by ID
const getFourthContainerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fourthContainer = await fourthContainerModel.getFourthContainerById(id);
    
    if (!fourthContainer) {
      return next(createError(404, 'Fourth container not found'));
    }
    
    res.status(200).json({
      success: true,
      data: fourthContainer
    });
  } catch (error) {
    next(createError(500, 'Error retrieving fourth container'));
  }
};

// Create new FourthContainer
const createFourthContainer = async (req, res, next) => {
  try {
    // Handle file upload
    uploadImage(req, res, async function(err) {
      if (err) {
        return next(createError(400, err.message));
      }
      
      try {
        const { name, name_ar, description, description_ar, status, url, points } = req.body;
        
        // Validate required fields
        if (!name || !name_ar) {
          // Remove uploaded file if validation fails
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return next(createError(400, 'Name and name_ar are required fields'));
        }
        
        // Parse points if provided as string
        let parsedPoints = [];
        if (points) {
          try {
            // Check if points is already an array or a JSON string
            parsedPoints = typeof points === 'string' ? 
              (points.startsWith('[') ? JSON.parse(points) : [points]) : 
              points;
          } catch (error) {
            // If parsing fails, treat it as a single point
            parsedPoints = [points];
          }
        }
        
        // Prepare data for database
        const fourthContainerData = {
          name,
          name_ar,
          description,
          description_ar,
          status: status === 'true' || status === true,
          url,
          points: parsedPoints,
          image: req.file ? getImageUrl(req.file.filename) : null
        };
        
        const newFourthContainer = await fourthContainerModel.createFourthContainer(fourthContainerData);
        
        // Parse points for response
        newFourthContainer.points = JSON.parse(newFourthContainer.points || '[]');
        
        res.status(201).json({
          success: true,
          data: newFourthContainer
        });
      } catch (error) {
        // Remove uploaded file if database operation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        next(createError(500, 'Error creating fourth container'));
      }
    });
  } catch (error) {
    next(createError(500, 'Error processing request'));
  }
};

// Update FourthContainer
const updateFourthContainer = async (req, res, next) => {
  try {
    // Handle file upload
    uploadImage(req, res, async function(err) {
      if (err) {
        return next(createError(400, err.message));
      }
      
      try {
        const { id } = req.params;
        const { name, name_ar, description, description_ar, status, url, points } = req.body;
        
        // Check if FourthContainer exists
        const existingFourthContainer = await fourthContainerModel.getFourthContainerById(id);
        if (!existingFourthContainer) {
          // Remove uploaded file if FourthContainer doesn't exist
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return next(createError(404, 'Fourth container not found'));
        }
        
        // Validate required fields
        if (!name || !name_ar) {
          // Remove uploaded file if validation fails
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return next(createError(400, 'Name and name_ar are required fields'));
        }
        
        // Parse points if provided
        let parsedPoints = undefined;
        if (points) {
          try {
            // Check if points is already an array or a JSON string
            parsedPoints = typeof points === 'string' ? 
              (points.startsWith('[') ? JSON.parse(points) : [points]) : 
              points;
          } catch (error) {
            // If parsing fails, treat it as a single point
            parsedPoints = [points];
          }
        }
        
        // Prepare data for database
        const fourthContainerData = {
          name,
          name_ar,
          description,
          description_ar,
          status: status === 'true' || status === true,
          url,
          points: parsedPoints
        };
        
        // Handle image update
        if (req.file) {
          fourthContainerData.image = getImageUrl(req.file.filename);
          
          // Delete old image if it exists
          if (existingFourthContainer.image) {
            const oldImagePath = path.join(__dirname, '..', existingFourthContainer.image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
        }
        
        const updatedFourthContainer = await fourthContainerModel.updateFourthContainer(id, fourthContainerData);
        
        res.status(200).json({
          success: true,
          data: updatedFourthContainer
        });
      } catch (error) {
        // Remove uploaded file if database operation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        next(createError(500, 'Error updating fourth container'));
      }
    });
  } catch (error) {
    next(createError(500, 'Error processing request'));
  }
};

// Delete FourthContainer
const deleteFourthContainer = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if FourthContainer exists
    const existingFourthContainer = await fourthContainerModel.getFourthContainerById(id);
    if (!existingFourthContainer) {
      return next(createError(404, 'Fourth container not found'));
    }
    
    // Delete the FourthContainer
    await fourthContainerModel.deleteFourthContainer(id);
    
    // Delete associated image if it exists
    if (existingFourthContainer.image) {
      const imagePath = path.join(__dirname, '..', existingFourthContainer.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Fourth container deleted successfully'
    });
  } catch (error) {
    next(createError(500, 'Error deleting fourth container'));
  }
};

// Update FourthContainer Status
const updateFourthContainerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (status === undefined) {
      return next(createError(400, 'Status is required'));
    }
    
    // Check if FourthContainer exists
    const existingFourthContainer = await fourthContainerModel.getFourthContainerById(id);
    if (!existingFourthContainer) {
      return next(createError(404, 'Fourth container not found'));
    }
    
    const boolStatus = status === 'true' || status === true;
    const updatedFourthContainer = await fourthContainerModel.updateFourthContainerStatus(id, boolStatus);
    
    res.status(200).json({
      success: true,
      data: updatedFourthContainer
    });
  } catch (error) {
    next(createError(500, 'Error updating fourth container status'));
  }
};

// Update FourthContainer Points
const updateFourthContainerPoints = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { points } = req.body;
    
    if (!points) {
      return next(createError(400, 'Points are required'));
    }
    
    // Check if FourthContainer exists
    const existingFourthContainer = await fourthContainerModel.getFourthContainerById(id);
    if (!existingFourthContainer) {
      return next(createError(404, 'Fourth container not found'));
    }
    
    // Parse points if provided as string
    let parsedPoints = [];
    try {
      // Check if points is already an array or a JSON string
      parsedPoints = typeof points === 'string' ? 
        (points.startsWith('[') ? JSON.parse(points) : [points]) : 
        points;
    } catch (error) {
      // If parsing fails, treat it as a single point
      parsedPoints = [points];
    }
    
    const updatedFourthContainer = await fourthContainerModel.updateFourthContainerPoints(id, parsedPoints);
    
    res.status(200).json({
      success: true,
      data: updatedFourthContainer
    });
  } catch (error) {
    next(createError(500, 'Error updating fourth container points'));
  }
};

module.exports = {
  getAllFourthContainers,
  getFourthContainerById,
  createFourthContainer,
  updateFourthContainer,
  deleteFourthContainer,
  updateFourthContainerStatus,
  updateFourthContainerPoints
};
