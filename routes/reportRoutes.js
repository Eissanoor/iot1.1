const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');

// Validation rules for report generation
const reportValidation = [
  body('reportType')
    .notEmpty()
    .withMessage('Report type is required')
    .isIn(['Asset Inventory', 'Asset Utilization', 'Maintenance History', 'Asset Location'])
    .withMessage('Invalid report type. Must be one of: Asset Inventory, Asset Utilization, Maintenance History, Asset Location'),
  
  body('dateRange')
    .notEmpty()
    .withMessage('Date range is required')
    .isIn(['today', 'thisWeek', 'thisMonth', 'thisQuarter', 'thisYear'])
    .withMessage('Invalid date range. Must be one of: today, thisWeek, thisMonth, thisQuarter, thisYear'),
  
  body('format')
    .optional()
    .isIn(['JSON', 'PDF', 'Excel', 'CSV'])
    .withMessage('Invalid format. Must be one of: JSON, PDF, Excel, CSV')
];

// Route to generate report
router.post('/generate', verifyToken, reportValidation, reportController.generateReport);

// Route to get available report types
router.get('/types', verifyToken, reportController.getReportTypes);

// Route to get available date ranges
router.get('/date-ranges', verifyToken, reportController.getDateRanges);

// Route to get available formats
router.get('/formats', verifyToken, reportController.getFormats);

module.exports = router;
