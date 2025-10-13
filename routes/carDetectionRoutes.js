const express = require('express');
const router = express.Router();
const {
  createCarDetection,
  getAllCarDetections,
  getCarDetectionById,
  getCurrentCarDetection,
  updateCarDetection,
  deleteCarDetection,
  getCarDetectionHistory,
  getDetectionSummary,
  exportCarDetectionToCSV,
  getCarDetectionData
} = require('../controllers/carDetectionController');

// Create new car detection record
router.post('/', createCarDetection);

// Get all car detection records with pagination
router.get('/', getAllCarDetections);

// Get current/latest car detection status
router.get('/current', getCurrentCarDetection);

// Get car detection history with time range filtering
router.get('/history', getCarDetectionHistory);

// Get detection summary
router.get('/summary', getDetectionSummary);

// Get car detection data with period filtering and optional CSV export
router.get('/data', getCarDetectionData);

// Export car detection data to CSV
router.get('/export', exportCarDetectionToCSV);

// Get car detection record by ID
router.get('/:id', getCarDetectionById);

// Update car detection record
router.put('/:id', updateCarDetection);

// Delete car detection record
router.delete('/:id', deleteCarDetection);

module.exports = router;
