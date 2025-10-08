const express = require('express');
const router = express.Router();
const fourthContainerController = require('../controllers/fourthContainerController');
const { verifyToken } = require('../middleware/auth');

// Get all fourth containers
router.get('/', fourthContainerController.getAllFourthContainers);

// Get fourth container by ID
router.get('/:id', fourthContainerController.getFourthContainerById);

// Create new fourth container (protected route)
router.post('/', verifyToken, fourthContainerController.createFourthContainer);

// Update fourth container (protected route)
router.put('/:id', verifyToken, fourthContainerController.updateFourthContainer);

// Delete fourth container (protected route)
router.delete('/:id', verifyToken, fourthContainerController.deleteFourthContainer);

// Update fourth container status (protected route)
router.patch('/:id/status', verifyToken, fourthContainerController.updateFourthContainerStatus);

// Update fourth container points (protected route)
router.patch('/:id/points', verifyToken, fourthContainerController.updateFourthContainerPoints);

// Update fourth container points_ar (protected route)
router.patch('/:id/points-ar', verifyToken, fourthContainerController.updateFourthContainerPointsAr);

module.exports = router;
