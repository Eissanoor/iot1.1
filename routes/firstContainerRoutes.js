const express = require('express');
const router = express.Router();
const firstContainerController = require('../controllers/firstContainerController');
const { verifyToken } = require('../middleware/auth');

// Get all first containers
router.get('/', firstContainerController.getAllFirstContainers);

// Get first container by ID
router.get('/:id', firstContainerController.getFirstContainerById);

// Create new first container (protected route)
router.post('/', verifyToken, firstContainerController.createFirstContainer);

// Update first container (protected route)
router.put('/:id', verifyToken, firstContainerController.updateFirstContainer);

// Delete first container (protected route)
router.delete('/:id', verifyToken, firstContainerController.deleteFirstContainer);

// Update first container status (protected route)
router.patch('/:id/status', verifyToken, firstContainerController.updateFirstContainerStatus);

module.exports = router;
