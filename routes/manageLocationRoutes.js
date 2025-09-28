const express = require('express');
const router = express.Router();
const {
  getAllManageLocations,
  getManageLocationById,
  createManageLocation,
  updateManageLocation,
  deleteManageLocation,
  getManageLocationsByLocationType
} = require('../controllers/manageLocationController');
const authMiddleware = require('../middleware/auth');

// GET /api/manage-locations - Get all manage locations
router.get('/', getAllManageLocations);

// GET /api/manage-locations/:id - Get manage location by ID
router.get('/:id', getManageLocationById);

// POST /api/manage-locations - Create new manage location (protected)
router.post('/', authMiddleware.verifyToken, createManageLocation);

// PUT /api/manage-locations/:id - Update manage location (protected)
router.put('/:id', authMiddleware.verifyToken, updateManageLocation);

// DELETE /api/manage-locations/:id - Delete manage location (protected)
router.delete('/:id', authMiddleware.verifyToken, deleteManageLocation);

// GET /api/manage-locations/location-type/:locationTypeId - Get manage locations by location type
router.get('/location-type/:locationTypeId', getManageLocationsByLocationType);

module.exports = router;
