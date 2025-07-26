const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const auth = require('../middleware/auth');

// Create a new brand - Protected route
router.post('/', auth, brandController.createBrand);

// Get all brands
router.get('/', brandController.getAllBrands);

// Get a single brand by ID
router.get('/:id', brandController.getBrandById);

// Update a brand - Protected route
router.put('/:id', auth, brandController.updateBrand);

// Delete a brand - Protected route
router.delete('/:id', auth, brandController.deleteBrand);

module.exports = router; 