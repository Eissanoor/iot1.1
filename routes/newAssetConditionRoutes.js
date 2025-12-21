const express = require('express');
const router = express.Router();
const newAssetConditionController = require('../controllers/newAssetConditionController');

// Get asset condition statistics for dashboard cards
router.get('/stats', newAssetConditionController.getAssetConditionStats);

// Get condition trend data for last 6 months (line chart)
router.get('/condition-trend', newAssetConditionController.getConditionTrend);

// Get condition by category data (donut chart)
router.get('/condition-by-category', newAssetConditionController.getConditionByCategory);

// Get department health score data (bar chart)
router.get('/department-health-score', newAssetConditionController.getDepartmentHealthScore);

// Get all assets with condition details (for Asset Condition Details page)
router.get('/assets', newAssetConditionController.getAssetConditionDetails);

// Get single asset condition detail by ID
router.get('/assets/:id', newAssetConditionController.getAssetConditionDetailById);

// Schedule inspection for an asset
router.post('/schedule-inspection', newAssetConditionController.scheduleInspection);

// Export asset condition report
router.get('/export-report', newAssetConditionController.exportReport);

// Get summary cards data for Asset Condition Details page
router.get('/summary-cards', newAssetConditionController.getSummaryCards);

// Get assets requiring attention
router.get('/assets-requiring-attention', newAssetConditionController.getAssetsRequiringAttention);

// Get upcoming inspections
router.get('/upcoming-inspections', newAssetConditionController.getUpcomingInspections);

module.exports = router;

