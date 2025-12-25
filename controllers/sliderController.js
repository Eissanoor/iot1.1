const prisma = require('../prisma/client');

// Controller methods for Slider CRUD operations
exports.createSlider = async (req, res) => {
  try {
    const {
      name,
      assignPage,
      displayPosition,
      transitionStyle,
      transitionTime,
      slideDuration,
      navigationStyle,
      slideOption
    } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        error: 'Required field missing: name is required' 
      });
    }
    
    // Create new slider
    const slider = await prisma.slider.create({
      data: {
        name,
        assignPage: assignPage || null,
        displayPosition: displayPosition || null,
        transitionStyle: transitionStyle || null,
        transitionTime: transitionTime ? parseInt(transitionTime) : null,
        slideDuration: slideDuration ? parseInt(slideDuration) : null,
        navigationStyle: navigationStyle || null,
        slideOption: slideOption || null
      }
    });
    
    res.status(201).json({ 
      message: 'Slider created successfully',
      slider
    });
  } catch (error) {
    console.error('Error creating slider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllSliders = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
    const skip = (page - 1) * limit;
    const search = req.query.search;
    
    // Build filter object
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assignPage: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get sliders with pagination, sort by createdAt descending (newest first)
    const sliders = await prisma.slider.findMany({
      where,
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    // Get total count
    const totalItems = await prisma.slider.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    
    res.status(200).json({
      pagination: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      sliders
    });
  } catch (error) {
    console.error('Error retrieving sliders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSliderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find slider by ID
    const slider = await prisma.slider.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }
    
    res.status(200).json(slider);
  } catch (error) {
    console.error('Error retrieving slider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      assignPage,
      displayPosition,
      transitionStyle,
      transitionTime,
      slideDuration,
      navigationStyle,
      slideOption
    } = req.body;
    
    // Check if slider exists
    const existingSlider = await prisma.slider.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingSlider) {
      return res.status(404).json({ message: 'Slider not found' });
    }
    
    // Update slider
    const updatedSlider = await prisma.slider.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : existingSlider.name,
        assignPage: assignPage !== undefined ? assignPage : existingSlider.assignPage,
        displayPosition: displayPosition !== undefined ? displayPosition : existingSlider.displayPosition,
        transitionStyle: transitionStyle !== undefined ? transitionStyle : existingSlider.transitionStyle,
        transitionTime: transitionTime !== undefined ? (transitionTime ? parseInt(transitionTime) : null) : existingSlider.transitionTime,
        slideDuration: slideDuration !== undefined ? (slideDuration ? parseInt(slideDuration) : null) : existingSlider.slideDuration,
        navigationStyle: navigationStyle !== undefined ? navigationStyle : existingSlider.navigationStyle,
        slideOption: slideOption !== undefined ? slideOption : existingSlider.slideOption
      }
    });
    
    res.status(200).json({
      message: 'Slider updated successfully',
      slider: updatedSlider
    });
  } catch (error) {
    console.error('Error updating slider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if slider exists
    const existingSlider = await prisma.slider.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingSlider) {
      return res.status(404).json({ message: 'Slider not found' });
    }
    
    // Delete slider
    await prisma.slider.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Slider deleted successfully' });
  } catch (error) {
    console.error('Error deleting slider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

