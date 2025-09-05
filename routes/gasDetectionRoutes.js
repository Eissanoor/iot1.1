const express = require('express');
const router = express.Router();
const {
  createGasDetection,
  getAllGasDetections,
  getGasDetectionById,
  getCurrentGasLevel,
  updateGasDetection,
  deleteGasDetection,
  getGasLevelHistory,
  getSafetyStatusSummary
} = require('../controllers/gasDetectionController');

// Create new gas detection record
router.post('/', createGasDetection);

// Get all gas detection records with pagination
router.get('/', getAllGasDetections);

// Get current/latest gas level
router.get('/current', getCurrentGasLevel);

// Get gas level history with time range filtering
router.get('/history', getGasLevelHistory);

// Get safety status summary
router.get('/safety-summary', getSafetyStatusSummary);

// Get gas detection record by ID
router.get('/:id', getGasDetectionById);

// Update gas detection record
router.put('/:id', updateGasDetection);

// Delete gas detection record
router.delete('/:id', deleteGasDetection);

module.exports = router;
