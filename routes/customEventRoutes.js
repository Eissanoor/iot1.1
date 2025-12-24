const express = require('express');
const router = express.Router();
const customEventController = require('../controllers/customEventController');
const authMiddleware = require('../middleware/auth');

// Get event types (for dropdown)
router.get('/types', customEventController.getEventTypes);

// Get all custom events with filters
router.get('/', customEventController.getAllCustomEvents);

// Get custom events by asset ID
router.get('/asset/:newAssetId', customEventController.getCustomEventsByAssetId);

// Get custom event by ID
router.get('/:id', customEventController.getCustomEventById);

// Create custom event (with file upload support)
router.post(
  '/',
  customEventController.uploadEventFiles,
  customEventController.createCustomEvent
);

// Update custom event (with optional file upload support)
router.put(
  '/:id',
  customEventController.uploadEventFiles,
  customEventController.updateCustomEvent
);

// Delete custom event
router.delete('/:id', customEventController.deleteCustomEvent);

module.exports = router;

