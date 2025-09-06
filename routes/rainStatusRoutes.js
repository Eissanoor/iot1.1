const express = require('express');
const router = express.Router();
const {
  createRainStatus,
  getAllRainStatus,
  getRainStatusById,
  getCurrentRainStatus,
  updateRainStatus,
  deleteRainStatus,
  getRainHistory,
  getRainStatistics
} = require('../controllers/rainStatusController');

// Create new rain status record
router.post('/', createRainStatus);

// Get all rain status records with pagination
router.get('/', getAllRainStatus);

// Get current/latest rain status
router.get('/current', getCurrentRainStatus);

// Get rain history with time range filtering
router.get('/history', getRainHistory);

// Get rain statistics summary
router.get('/statistics', getRainStatistics);

// Get rain status record by ID
router.get('/:id', getRainStatusById);

// Update rain status record
router.put('/:id', updateRainStatus);

// Delete rain status record
router.delete('/:id', deleteRainStatus);

module.exports = router;
