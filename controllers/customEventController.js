const prisma = require('../prisma/client');
const { uploadDocuments, getDocumentUrl } = require('../utils/uploadUtils');

// Middleware for handling multiple file uploads
exports.uploadEventFiles = uploadDocuments.array('attachments', 10); // Allow up to 10 files

/**
 * Create a new custom event
 * POST /api/custom-events
 * Body: eventTitle, eventType, description, eventDate, newAssetId, createdByUserId (optional), createdByAdminId (optional)
 * Files: attachments (multipart/form-data)
 */
exports.createCustomEvent = async (req, res) => {
  try {
    const {
      eventTitle,
      eventType,
      description,
      eventDate,
      newAssetId,
      createdByUserId,
      createdByAdminId
    } = req.body;

    // Validate required fields
    if (!eventTitle || !eventType || !eventDate || !newAssetId) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: eventTitle, eventType, eventDate, and newAssetId are required'
      });
    }

    // Validate asset exists
    const asset = await prisma.newAsset.findUnique({
      where: { id: parseInt(newAssetId) }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Validate event date
    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid eventDate format'
      });
    }

    // Handle file uploads
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        uploadedFiles.push(getDocumentUrl(file.filename));
      });
    }

    // Store attachments as JSON string
    const attachmentsJson = uploadedFiles.length > 0 ? JSON.stringify(uploadedFiles) : null;

    // Validate user/admin if provided
    if (createdByUserId) {
      const user = await prisma.user.findUnique({
        where: { id: createdByUserId }
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    if (createdByAdminId) {
      const admin = await prisma.admin.findUnique({
        where: { id: createdByAdminId }
      });
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }
    }

    // Create custom event
    const customEvent = await prisma.customEvent.create({
      data: {
        eventTitle,
        eventType,
        description: description || null,
        eventDate: parsedEventDate,
        attachments: attachmentsJson,
        newAssetId: parseInt(newAssetId),
        createdByUserId: createdByUserId || null,
        createdByAdminId: createdByAdminId || null
      },
      include: {
        newAsset: {
          include: {
            assetCategory: true,
            department: true,
            employee: true
          }
        }
      }
    });

    // Parse attachments for response
    const attachments = customEvent.attachments ? JSON.parse(customEvent.attachments) : [];

    res.status(201).json({
      success: true,
      message: 'Custom event created successfully',
      data: {
        ...customEvent,
        attachments
      }
    });
  } catch (error) {
    console.error('Error creating custom event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get all custom events with optional filters
 * GET /api/custom-events
 * Query params: newAssetId, eventType, startDate, endDate, page, limit
 */
exports.getAllCustomEvents = async (req, res) => {
  try {
    const {
      newAssetId,
      eventType,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const where = {};
    if (newAssetId) where.newAssetId = parseInt(newAssetId);
    if (eventType) where.eventType = eventType;

    // Date range filtering
    if (startDate || endDate) {
      where.eventDate = {};
      if (startDate) where.eventDate.gte = new Date(startDate);
      if (endDate) where.eventDate.lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get custom events
    const [customEvents, totalCount] = await Promise.all([
      prisma.customEvent.findMany({
        where,
        skip,
        take,
        orderBy: { eventDate: 'desc' },
        include: {
          newAsset: {
            include: {
              assetCategory: true,
              department: true,
              employee: true
            }
          }
        }
      }),
      prisma.customEvent.count({ where })
    ]);

    // Parse attachments for each event
    const eventsWithAttachments = customEvents.map(event => ({
      ...event,
      attachments: event.attachments ? JSON.parse(event.attachments) : []
    }));

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      data: eventsWithAttachments,
      pagination: {
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        currentPage: parseInt(page),
        totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error retrieving custom events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get custom event by ID
 * GET /api/custom-events/:id
 */
exports.getCustomEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const customEvent = await prisma.customEvent.findUnique({
      where: { id: parseInt(id) },
      include: {
        newAsset: {
          include: {
            assetCategory: true,
            department: true,
            employee: true,
            assetCondition: true,
            location: true
          }
        }
      }
    });

    if (!customEvent) {
      return res.status(404).json({
        success: false,
        message: 'Custom event not found'
      });
    }

    // Parse attachments
    const attachments = customEvent.attachments ? JSON.parse(customEvent.attachments) : [];

    res.status(200).json({
      success: true,
      data: {
        ...customEvent,
        attachments
      }
    });
  } catch (error) {
    console.error('Error retrieving custom event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get custom events by asset ID
 * GET /api/custom-events/asset/:newAssetId
 */
exports.getCustomEventsByAssetId = async (req, res) => {
  try {
    const { newAssetId } = req.params;
    const { eventType, startDate, endDate } = req.query;

    // Validate asset exists
    const asset = await prisma.newAsset.findUnique({
      where: { id: parseInt(newAssetId) }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Build filter
    const where = {
      newAssetId: parseInt(newAssetId)
    };

    if (eventType) where.eventType = eventType;

    if (startDate || endDate) {
      where.eventDate = {};
      if (startDate) where.eventDate.gte = new Date(startDate);
      if (endDate) where.eventDate.lte = new Date(endDate);
    }

    const customEvents = await prisma.customEvent.findMany({
      where,
      orderBy: { eventDate: 'desc' },
      include: {
        newAsset: {
          include: {
            assetCategory: true,
            department: true,
            employee: true
          }
        }
      }
    });

    // Parse attachments
    const eventsWithAttachments = customEvents.map(event => ({
      ...event,
      attachments: event.attachments ? JSON.parse(event.attachments) : []
    }));

    res.status(200).json({
      success: true,
      asset,
      data: eventsWithAttachments,
      totalCount: eventsWithAttachments.length
    });
  } catch (error) {
    console.error('Error retrieving custom events by asset ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update custom event
 * PUT /api/custom-events/:id
 * Body: eventTitle, eventType, description, eventDate, newAssetId (optional)
 * Files: attachments (multipart/form-data, optional)
 */
exports.updateCustomEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      eventTitle,
      eventType,
      description,
      eventDate,
      newAssetId
    } = req.body;

    // Check if event exists
    const existingEvent = await prisma.customEvent.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Custom event not found'
      });
    }

    // Validate asset if newAssetId is provided
    if (newAssetId) {
      const asset = await prisma.newAsset.findUnique({
        where: { id: parseInt(newAssetId) }
      });

      if (!asset) {
        return res.status(404).json({
          success: false,
          message: 'Asset not found'
        });
      }
    }

    // Parse event date if provided
    let parsedEventDate = existingEvent.eventDate;
    if (eventDate) {
      parsedEventDate = new Date(eventDate);
      if (isNaN(parsedEventDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid eventDate format'
        });
      }
    }

    // Handle file uploads (if new files are uploaded, replace old ones)
    let attachmentsJson = existingEvent.attachments;
    if (req.files && req.files.length > 0) {
      const uploadedFiles = [];
      req.files.forEach(file => {
        uploadedFiles.push(getDocumentUrl(file.filename));
      });
      attachmentsJson = JSON.stringify(uploadedFiles);
    }

    // Update custom event
    const updatedEvent = await prisma.customEvent.update({
      where: { id: parseInt(id) },
      data: {
        eventTitle: eventTitle !== undefined ? eventTitle : existingEvent.eventTitle,
        eventType: eventType !== undefined ? eventType : existingEvent.eventType,
        description: description !== undefined ? description : existingEvent.description,
        eventDate: parsedEventDate,
        newAssetId: newAssetId !== undefined ? parseInt(newAssetId) : existingEvent.newAssetId,
        attachments: attachmentsJson
      },
      include: {
        newAsset: {
          include: {
            assetCategory: true,
            department: true,
            employee: true
          }
        }
      }
    });

    // Parse attachments
    const attachments = updatedEvent.attachments ? JSON.parse(updatedEvent.attachments) : [];

    res.status(200).json({
      success: true,
      message: 'Custom event updated successfully',
      data: {
        ...updatedEvent,
        attachments
      }
    });
  } catch (error) {
    console.error('Error updating custom event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete custom event
 * DELETE /api/custom-events/:id
 */
exports.deleteCustomEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const existingEvent = await prisma.customEvent.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Custom event not found'
      });
    }

    // Delete custom event
    await prisma.customEvent.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Custom event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting custom event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get event types (for dropdown options)
 * GET /api/custom-events/types
 */
exports.getEventTypes = async (req, res) => {
  try {
    // Get distinct event types from database
    const events = await prisma.customEvent.findMany({
      select: {
        eventType: true
      },
      distinct: ['eventType']
    });

    // Standard event types
    const standardTypes = [
      'MAINTENANCE',
      'INSPECTION',
      'FUEL',
      'ISSUE',
      'ASSIGNMENT',
      'TRANSFER',
      'UPDATE'
    ];

    // Combine standard types with custom types from database
    const allTypes = [...new Set([...standardTypes, ...events.map(e => e.eventType)])];

    res.status(200).json({
      success: true,
      data: allTypes.sort()
    });
  } catch (error) {
    console.error('Error retrieving event types:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

