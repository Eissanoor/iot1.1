const express = require('express');
const router = express.Router();
const {
  createMotionDetection,
  getAllMotionDetections,
  getMotionDetectionById,
  getLatestMotionDetection,
  getMotionDetectionStats,
  getMotionDetectionActivity,
  getMotionDetectionDashboard,
  updateMotionDetection,
  deleteMotionDetection,
} = require('../controllers/motionDetectionController');

// Create a new motion detection record
router.post('/', createMotionDetection);

// Get all motion detection records (with optional pagination)
router.get('/', getAllMotionDetections);

// Get motion detection dashboard data (combines all UI data)
router.get('/dashboard', getMotionDetectionDashboard);

// Get latest motion detection record
router.get('/latest', getLatestMotionDetection);

// Get motion detection statistics
router.get('/stats', getMotionDetectionStats);

// Get motion detection activity data for chart
router.get('/activity', getMotionDetectionActivity);

// Get motion detection record by ID
router.get('/:id', getMotionDetectionById);

// Update motion detection record
router.put('/:id', updateMotionDetection);

// Delete motion detection record
router.delete('/:id', deleteMotionDetection);

module.exports = router;
