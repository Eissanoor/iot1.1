const express = require('express');
const router = express.Router();
const secondContainerController = require('../controllers/secondContainerController');
const { verifyToken } = require('../middleware/auth');

// Get all second containers
router.get('/', secondContainerController.getAllSecondContainers);

// Get second container by ID
router.get('/:id', secondContainerController.getSecondContainerById);

// Create new second container (protected route)
router.post('/', verifyToken, secondContainerController.createSecondContainer);

// Update second container (protected route)
router.put('/:id', verifyToken, secondContainerController.updateSecondContainer);

// Delete second container (protected route)
router.delete('/:id', verifyToken, secondContainerController.deleteSecondContainer);

// Update second container status (protected route)
router.patch('/:id/status', verifyToken, secondContainerController.updateSecondContainerStatus);

module.exports = router;
