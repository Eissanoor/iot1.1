const Location = require('../models/location');

// Controller for handling location-related operations
const locationController = {
  // Create a new location
  async createLocation(req, res) {
    try {
      const { company, building, level_floor, office, room, locationCode } = req.body;
      
      // Check if all required fields are provided
      if (!company || !building || !level_floor || !office || !room || !locationCode) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required: company, building, level_floor, office, room, locationCode' 
        });
      }
      
      // Check if location code already exists
      const existingLocation = await Location.getByCode(locationCode);
      if (existingLocation) {
        return res.status(400).json({ 
          success: false, 
          message: 'Location with this code already exists' 
        });
      }
      
      // Create new location
      const newLocation = await Location.create({
        company,
        building,
        level_floor,
        office,
        room,
        locationCode
      });
      
      res.status(201).json({
        success: true,
        message: 'Location created successfully',
        data: newLocation
      });
    } catch (error) {
      console.error('Error creating location:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create location', 
        error: error.message 
      });
    }
  },

  // Get all locations
  async getAllLocations(req, res) {
    try {
      const locations = await Location.getAll();
      
      res.status(200).json({
        success: true,
        count: locations.length,
        data: locations
      });
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch locations', 
        error: error.message 
      });
    }
  },

  // Get location by ID
  async getLocationById(req, res) {
    try {
      const { id } = req.params;
      
      const location = await Location.getById(id);
      
      if (!location) {
        return res.status(404).json({ 
          success: false, 
          message: 'Location not found' 
        });
      }
      
      res.status(200).json({
        success: true,
        data: location
      });
    } catch (error) {
      console.error('Error fetching location:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch location', 
        error: error.message 
      });
    }
  },

  // Update location
  async updateLocation(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if location exists
      const location = await Location.getById(id);
      if (!location) {
        return res.status(404).json({ 
          success: false, 
          message: 'Location not found' 
        });
      }
      
      // If locationCode is being updated, check if it's already in use
      if (updateData.locationCode && updateData.locationCode !== location.locationCode) {
        const existingLocation = await Location.getByCode(updateData.locationCode);
        if (existingLocation) {
          return res.status(400).json({ 
            success: false, 
            message: 'Location code already in use' 
          });
        }
      }
      
      // Update location
      const updatedLocation = await Location.update(id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Location updated successfully',
        data: updatedLocation
      });
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update location', 
        error: error.message 
      });
    }
  },

  // Delete location
  async deleteLocation(req, res) {
    try {
      const { id } = req.params;
      
      // Check if location exists
      const location = await Location.getById(id);
      if (!location) {
        return res.status(404).json({ 
          success: false, 
          message: 'Location not found' 
        });
      }
      
      // Delete location
      await Location.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Location deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting location:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete location', 
        error: error.message 
      });
    }
  }
};

module.exports = locationController; 