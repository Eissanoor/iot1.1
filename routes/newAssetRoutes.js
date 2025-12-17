const express = require('express');
const router = express.Router();
const newAssetController = require('../controllers/newAssetController');

// Create a new asset with image upload
// Expects multipart/form-data with 'image' as file field
router.post(
  '/',
  newAssetController.uploadNewAssetImage,
  newAssetController.createNewAsset
);

// Get all new assets
router.get('/', newAssetController.getAllNewAssets);

// Get a single new asset by ID
router.get('/:id', newAssetController.getNewAssetById);

// Update asset with optional image upload
// Expects multipart/form-data with 'image' as file field
router.put(
  '/:id',
  newAssetController.uploadNewAssetImage,
  newAssetController.updateNewAsset
);

// Delete asset
router.delete('/:id', newAssetController.deleteNewAsset);

module.exports = router;


