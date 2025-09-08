const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const authMiddleware = require('../middleware/auth');

// Routes for FAQ management
// Create a new FAQ (protected route)
router.post('/', 
  authMiddleware.verifyAdminToken, 
  faqController.createFAQ
);

// Get all FAQs (public route)
router.get('/', faqController.getAllFAQs);

// Get FAQ statistics (protected route)
router.get('/stats', authMiddleware.verifyAdminToken, faqController.getFAQStats);

// Get FAQ by ID (public route)
router.get('/:id', faqController.getFAQById);

// Update FAQ (protected route)
router.put('/:id', 
  authMiddleware.verifyAdminToken, 
  faqController.updateFAQ
);

// Delete FAQ (protected route)
router.delete('/:id', authMiddleware.verifyAdminToken, faqController.deleteFAQ);

module.exports = router;
