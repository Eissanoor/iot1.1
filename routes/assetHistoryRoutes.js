const express = require('express');
const router = express.Router();
const assetHistoryController = require('../controllers/assetHistoryController');
const authMiddleware = require('../middleware/auth');

// Get complete asset history with filters
// Query params: startDate, endDate, eventType, performedBy, sortOrder
router.get('/:assetId', assetHistoryController.getAssetHistory);

// Get event distribution (for donut chart)
// Query params: startDate, endDate
router.get('/:assetId/distribution', assetHistoryController.getEventDistribution);

// Get summary statistics
// Query params: startDate, endDate
router.get('/:assetId/statistics', assetHistoryController.getSummaryStatistics);

// Get smart insights
// Query params: startDate, endDate
router.get('/:assetId/insights', assetHistoryController.getSmartInsights);

module.exports = router;

