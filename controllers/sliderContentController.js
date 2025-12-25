const prisma = require('../prisma/client');
const { getImageUrl } = require('../utils/uploadUtils');

// Controller methods for SliderContent CRUD operations
exports.createSliderContent = async (req, res) => {
  try {
    const {
      name,
      sliderId,
      subTitle,
      buttonText,
      buttonLink,
      textAlignment,
      textColor,
      overlayColor,
      buttonStyle,
      contentPosition,
      titleAnimation,
      subTitleAnimation,
      buttonAnimation,
      animationDelay,
      animationDuration,
      staggerChildren,
      visibility,
      schedule,
      status,
      slideOrder,
      customCSSClass,
      additionalSettings
    } = req.body;
    
    // Validate required fields
    if (!name || !sliderId) {
      return res.status(400).json({ 
        error: 'Required fields missing: name and sliderId are required' 
      });
    }
    
    // Check if slider exists
    const slider = await prisma.slider.findUnique({
      where: { id: parseInt(sliderId) }
    });
    
    if (!slider) {
      return res.status(404).json({ error: 'Slider not found' });
    }
    
    // Handle background image file upload
    let backgroundImagePath = null;
    if (req.file) {
      backgroundImagePath = getImageUrl(req.file.filename);
    }
    
    // Parse numeric fields
    const parsedAnimationDelay = animationDelay !== undefined && animationDelay !== null && animationDelay !== '' 
      ? parseInt(animationDelay) : null;
    const parsedAnimationDuration = animationDuration !== undefined && animationDuration !== null && animationDuration !== '' 
      ? parseInt(animationDuration) : null;
    const parsedSlideOrder = slideOrder !== undefined && slideOrder !== null && slideOrder !== '' 
      ? parseInt(slideOrder) : 0;
    
    // Create new slider content
    const sliderContent = await prisma.sliderContent.create({
      data: {
        name,
        sliderId: parseInt(sliderId),
        subTitle: subTitle || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        backgroundImage: backgroundImagePath,
        textAlignment: textAlignment || null,
        textColor: textColor || null,
        overlayColor: overlayColor || null,
        buttonStyle: buttonStyle || null,
        contentPosition: contentPosition || null,
        titleAnimation: titleAnimation || null,
        subTitleAnimation: subTitleAnimation || null,
        buttonAnimation: buttonAnimation || null,
        animationDelay: parsedAnimationDelay,
        animationDuration: parsedAnimationDuration,
        staggerChildren: staggerChildren !== undefined ? Boolean(staggerChildren) : false,
        visibility: visibility !== undefined ? Boolean(visibility) : true,
        schedule: schedule || null,
        status: status || 'active',
        slideOrder: parsedSlideOrder,
        customCSSClass: customCSSClass || null,
        additionalSettings: additionalSettings || null
      },
      include: {
        slider: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.status(201).json({ 
      message: 'Slider content created successfully',
      sliderContent
    });
  } catch (error) {
    console.error('Error creating slider content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllSliderContents = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const sliderId = req.query.sliderId;
    const status = req.query.status;
    
    // Build filter object
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subTitle: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (sliderId) {
      where.sliderId = parseInt(sliderId);
    }
    if (status) {
      where.status = status;
    }
    
    // Get slider contents with pagination, sort by slideOrder and createdAt
    const sliderContents = await prisma.sliderContent.findMany({
      where,
      skip: skip,
      take: limit,
      orderBy: [
        { slideOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        slider: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Get total count
    const totalItems = await prisma.sliderContent.count({ where });
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
      sliderContents
    });
  } catch (error) {
    console.error('Error retrieving slider contents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSliderContentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find slider content by ID
    const sliderContent = await prisma.sliderContent.findUnique({
      where: { id: parseInt(id) },
      include: {
        slider: {
          select: {
            id: true,
            name: true,
            assignPage: true,
            displayPosition: true
          }
        }
      }
    });
    
    if (!sliderContent) {
      return res.status(404).json({ message: 'Slider content not found' });
    }
    
    res.status(200).json(sliderContent);
  } catch (error) {
    console.error('Error retrieving slider content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateSliderContent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      sliderId,
      subTitle,
      buttonText,
      buttonLink,
      textAlignment,
      textColor,
      overlayColor,
      buttonStyle,
      contentPosition,
      titleAnimation,
      subTitleAnimation,
      buttonAnimation,
      animationDelay,
      animationDuration,
      staggerChildren,
      visibility,
      schedule,
      status,
      slideOrder,
      customCSSClass,
      additionalSettings
    } = req.body;
    
    // Check if slider content exists
    const existingSliderContent = await prisma.sliderContent.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingSliderContent) {
      return res.status(404).json({ message: 'Slider content not found' });
    }
    
    // If sliderId is provided, validate it exists
    if (sliderId !== undefined) {
      const slider = await prisma.slider.findUnique({
        where: { id: parseInt(sliderId) }
      });
      
      if (!slider) {
        return res.status(404).json({ error: 'Slider not found' });
      }
    }
    
    // Handle background image file upload
    let backgroundImagePath = existingSliderContent.backgroundImage;
    if (req.file) {
      backgroundImagePath = getImageUrl(req.file.filename);
    }
    
    // Parse numeric fields
    const parsedAnimationDelay = animationDelay !== undefined && animationDelay !== null && animationDelay !== '' 
      ? parseInt(animationDelay) : (animationDelay === null ? null : existingSliderContent.animationDelay);
    const parsedAnimationDuration = animationDuration !== undefined && animationDuration !== null && animationDuration !== '' 
      ? parseInt(animationDuration) : (animationDuration === null ? null : existingSliderContent.animationDuration);
    const parsedSlideOrder = slideOrder !== undefined && slideOrder !== null && slideOrder !== '' 
      ? parseInt(slideOrder) : (slideOrder === null ? 0 : existingSliderContent.slideOrder);
    
    // Update slider content
    const updatedSliderContent = await prisma.sliderContent.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : existingSliderContent.name,
        sliderId: sliderId !== undefined ? parseInt(sliderId) : existingSliderContent.sliderId,
        subTitle: subTitle !== undefined ? subTitle : existingSliderContent.subTitle,
        buttonText: buttonText !== undefined ? buttonText : existingSliderContent.buttonText,
        buttonLink: buttonLink !== undefined ? buttonLink : existingSliderContent.buttonLink,
        backgroundImage: backgroundImagePath,
        textAlignment: textAlignment !== undefined ? textAlignment : existingSliderContent.textAlignment,
        textColor: textColor !== undefined ? textColor : existingSliderContent.textColor,
        overlayColor: overlayColor !== undefined ? overlayColor : existingSliderContent.overlayColor,
        buttonStyle: buttonStyle !== undefined ? buttonStyle : existingSliderContent.buttonStyle,
        contentPosition: contentPosition !== undefined ? contentPosition : existingSliderContent.contentPosition,
        titleAnimation: titleAnimation !== undefined ? titleAnimation : existingSliderContent.titleAnimation,
        subTitleAnimation: subTitleAnimation !== undefined ? subTitleAnimation : existingSliderContent.subTitleAnimation,
        buttonAnimation: buttonAnimation !== undefined ? buttonAnimation : existingSliderContent.buttonAnimation,
        animationDelay: parsedAnimationDelay,
        animationDuration: parsedAnimationDuration,
        staggerChildren: staggerChildren !== undefined ? Boolean(staggerChildren) : existingSliderContent.staggerChildren,
        visibility: visibility !== undefined ? Boolean(visibility) : existingSliderContent.visibility,
        schedule: schedule !== undefined ? schedule : existingSliderContent.schedule,
        status: status !== undefined ? status : existingSliderContent.status,
        slideOrder: parsedSlideOrder,
        customCSSClass: customCSSClass !== undefined ? customCSSClass : existingSliderContent.customCSSClass,
        additionalSettings: additionalSettings !== undefined ? additionalSettings : existingSliderContent.additionalSettings
      },
      include: {
        slider: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.status(200).json({
      message: 'Slider content updated successfully',
      sliderContent: updatedSliderContent
    });
  } catch (error) {
    console.error('Error updating slider content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteSliderContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if slider content exists
    const existingSliderContent = await prisma.sliderContent.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingSliderContent) {
      return res.status(404).json({ message: 'Slider content not found' });
    }
    
    // Delete background image file if exists
    if (existingSliderContent.backgroundImage) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '..', 'uploads', path.basename(existingSliderContent.backgroundImage));
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error('Error deleting image file:', error);
        }
      }
    }
    
    // Delete slider content
    await prisma.sliderContent.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Slider content deleted successfully' });
  } catch (error) {
    console.error('Error deleting slider content:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all slider contents by slider ID
exports.getSliderContentsBySliderId = async (req, res) => {
  try {
    const { sliderId } = req.params;
    
    // Check if slider exists
    const slider = await prisma.slider.findUnique({
      where: { id: parseInt(sliderId) }
    });
    
    if (!slider) {
      return res.status(404).json({ error: 'Slider not found' });
    }
    
    // Get all slider contents for this slider, ordered by slideOrder
    const sliderContents = await prisma.sliderContent.findMany({
      where: { sliderId: parseInt(sliderId) },
      orderBy: [
        { slideOrder: 'asc' },
        { createdAt: 'asc' }
      ]
    });
    
    res.status(200).json({
      slider: {
        id: slider.id,
        name: slider.name
      },
      sliderContents
    });
  } catch (error) {
    console.error('Error retrieving slider contents by slider ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

