const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const authMiddleware = require('../middleware/auth');

// Routes for asset management
// Create a new asset (protected route)
router.post('/', authMiddleware.verifyToken, assetController.createAsset);

// Get all assets
router.get('/', assetController.getAllAssets);

// Get asset by ID
router.get('/:id', assetController.getAssetById);

// Update asset (protected route)
router.put('/:id', authMiddleware.verifyToken, assetController.updateAsset);

// Delete asset (protected route)
router.delete('/:id', authMiddleware.verifyToken, assetController.deleteAsset);

module.exports = router; 