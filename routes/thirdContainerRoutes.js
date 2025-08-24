const express = require('express');
const router = express.Router();
const thirdContainerController = require('../controllers/thirdContainerController');
const { verifyToken } = require('../middleware/auth');

// Get all third containers
router.get('/', thirdContainerController.getAllThirdContainers);

// Get third container by ID
router.get('/:id', thirdContainerController.getThirdContainerById);

// Create new third container (protected route)
router.post('/', verifyToken, thirdContainerController.createThirdContainer);

// Update third container (protected route)
router.put('/:id', verifyToken, thirdContainerController.updateThirdContainer);

// Delete third container (protected route)
router.delete('/:id', verifyToken, thirdContainerController.deleteThirdContainer);

// Update third container status (protected route)
router.patch('/:id/status', verifyToken, thirdContainerController.updateThirdContainerStatus);

module.exports = router;
