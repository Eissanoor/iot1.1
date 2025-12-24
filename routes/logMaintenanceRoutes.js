const express = require('express');
const router = express.Router();
const logMaintenanceController = require('../controllers/logMaintenanceController');
const authMiddleware = require('../middleware/auth');

// Create a new log maintenance record (protected route)
router.post(
  '/',
  authMiddleware.verifyToken,
  logMaintenanceController.createLogMaintenance
);

// Get all log maintenance records
router.get('/', logMaintenanceController.getAllLogMaintenances);

// Get a single log maintenance record by ID
router.get('/:id', logMaintenanceController.getLogMaintenanceById);

// Update a log maintenance record (admin protected route)
router.put(
  '/:id',
  authMiddleware.verifyAdminToken,
  logMaintenanceController.updateLogMaintenance
);

// Delete a log maintenance record (admin protected route)
router.delete(
  '/:id',
  authMiddleware.verifyAdminToken,
  logMaintenanceController.deleteLogMaintenance
);

module.exports = router;


