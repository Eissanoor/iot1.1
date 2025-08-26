const express = require('express');
const router = express.Router();
const headerController = require('../controllers/headerController');
const { verifyToken } = require('../middleware/auth');

// Create a new header - protected route
router.post('/', verifyToken, headerController.createHeader);

// Get all headers - public route
router.get('/', headerController.getAllHeaders);

// Get a single header by ID - public route
router.get('/:id', headerController.getHeaderById);

// Update a header - protected route
router.put('/:id', verifyToken, headerController.updateHeader);

// Delete a header - protected route
router.delete('/:id', verifyToken, headerController.deleteHeader);

// Update header status - protected route
router.patch('/:id/status', verifyToken, headerController.updateHeaderStatus);

module.exports = router;
