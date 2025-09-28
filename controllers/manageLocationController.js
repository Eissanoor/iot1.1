const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all manage locations
const getAllManageLocations = async (req, res) => {
  try {
    const manageLocations = await prisma.manageLocation.findMany({
      include: {
        location: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: manageLocations
    });
  } catch (error) {
    console.error('Error fetching manage locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch manage locations',
      error: error.message
    });
  }
};

// Get manage location by ID
const getManageLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const manageLocation = await prisma.manageLocation.findUnique({
      where: { id: parseInt(id) },
      include: {
        location: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!manageLocation) {
      return res.status(404).json({
        success: false,
        message: 'Manage location not found'
      });
    }

    res.status(200).json({
      success: true,
      data: manageLocation
    });
  } catch (error) {
    console.error('Error fetching manage location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch manage location',
      error: error.message
    });
  }
};

// Create new manage location
const createManageLocation = async (req, res) => {
  try {
    const { locationName, address, locationTypeId, capacity } = req.body;

    // Validate required fields
    if (!locationName || !address || !locationTypeId || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: locationName, address, locationTypeId, capacity'
      });
    }

    // Check if location type exists
    const locationType = await prisma.location.findUnique({
      where: { id: parseInt(locationTypeId) }
    });

    if (!locationType) {
      return res.status(404).json({
        success: false,
        message: 'Location type not found'
      });
    }

    const manageLocation = await prisma.manageLocation.create({
      data: {
        locationName,
        address,
        locationTypeId: parseInt(locationTypeId),
        capacity: parseInt(capacity),
        userId: req.user.userId // Get user ID from JWT token
      },
      include: {
        location: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Manage location created successfully',
      data: manageLocation
    });
  } catch (error) {
    console.error('Error creating manage location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create manage location',
      error: error.message
    });
  }
};

// Update manage location
const updateManageLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { locationName, address, locationTypeId, capacity } = req.body;

    // Check if manage location exists
    const existingManageLocation = await prisma.manageLocation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingManageLocation) {
      return res.status(404).json({
        success: false,
        message: 'Manage location not found'
      });
    }

    // If locationTypeId is provided, check if it exists
    if (locationTypeId) {
      const locationType = await prisma.location.findUnique({
        where: { id: parseInt(locationTypeId) }
      });

      if (!locationType) {
        return res.status(404).json({
          success: false,
          message: 'Location type not found'
        });
      }
    }

    const updateData = {};
    if (locationName) updateData.locationName = locationName;
    if (address) updateData.address = address;
    if (locationTypeId) updateData.locationTypeId = parseInt(locationTypeId);
    if (capacity) updateData.capacity = parseInt(capacity);

    const manageLocation = await prisma.manageLocation.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        location: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Manage location updated successfully',
      data: manageLocation
    });
  } catch (error) {
    console.error('Error updating manage location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update manage location',
      error: error.message
    });
  }
};

// Delete manage location
const deleteManageLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if manage location exists
    const existingManageLocation = await prisma.manageLocation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingManageLocation) {
      return res.status(404).json({
        success: false,
        message: 'Manage location not found'
      });
    }

    await prisma.manageLocation.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Manage location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting manage location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete manage location',
      error: error.message
    });
  }
};

// Get manage locations by location type
const getManageLocationsByLocationType = async (req, res) => {
  try {
    const { locationTypeId } = req.params;

    const manageLocations = await prisma.manageLocation.findMany({
      where: { locationTypeId: parseInt(locationTypeId) },
      include: {
        location: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: manageLocations
    });
  } catch (error) {
    console.error('Error fetching manage locations by location type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch manage locations by location type',
      error: error.message
    });
  }
};

module.exports = {
  getAllManageLocations,
  getManageLocationById,
  createManageLocation,
  updateManageLocation,
  deleteManageLocation,
  getManageLocationsByLocationType
};
