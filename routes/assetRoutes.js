const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const authMiddleware = require('../middleware/auth');

// Routes for asset management
// Create a new asset with image upload (protected route)
router.post('/', 
  authMiddleware.verifyToken, 
  assetController.uploadAssetImage,
  assetController.createAsset
);

// Get all assets
router.get('/', assetController.getAllAssets);

// Get asset by ID
router.get('/:id', assetController.getAssetById);

// Update asset with image upload (protected route)
router.put('/:id', 
  authMiddleware.verifyToken, 
  assetController.uploadAssetImage,
  assetController.updateAsset
);

// Delete asset (protected route)
router.delete('/:id', authMiddleware.verifyToken, assetController.deleteAsset);

module.exports = router; 