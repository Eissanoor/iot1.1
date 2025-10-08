const express = require('express');
const router = express.Router();
const headingController = require('../controllers/headingController');
const { verifyToken } = require('../middleware/auth');

// Get all headings
router.get('/', headingController.getAllHeadings);

// Get heading by ID
router.get('/:id', headingController.getHeadingById);

// Create new heading (protected route)
router.post('/',  headingController.createHeading);

// Update heading (protected route)
router.put('/:id',  headingController.updateHeading);

// Delete heading (protected route)
router.delete('/:id',  headingController.deleteHeading);

module.exports = router;
