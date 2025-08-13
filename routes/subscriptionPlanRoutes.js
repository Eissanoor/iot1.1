const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const { verifyAdminToken } = require('../middleware/auth');

// Validation rules
const subscriptionPlanValidation = [
  check('name', 'Name is required').not().isEmpty().isString().trim(),
  check('displayName', 'Display name is required').not().isEmpty().isString().trim(),
  check('price', 'Price is required and must be a number').isNumeric(),
  check('billingCycle', 'Billing cycle is required').optional().isString().trim(),
  check('isPopular', 'Is popular must be a boolean').optional().isBoolean(),
  check('isActive', 'Is active must be a boolean').optional().isBoolean()
];

// @route   POST /api/subscription-plans
// @desc    Create a new subscription plan
// @access  Private/Admin
router.post(
  '/',
  [verifyAdminToken, ...subscriptionPlanValidation],
  subscriptionPlanController.createSubscriptionPlan
);

// @route   GET /api/subscription-plans
// @desc    Get all subscription plans
// @access  Public
router.get('/', subscriptionPlanController.getAllSubscriptionPlans);

// @route   GET /api/subscription-plans/:id
// @desc    Get subscription plan by ID
// @access  Public
router.get('/:id', subscriptionPlanController.getSubscriptionPlanById);

// @route   PUT /api/subscription-plans/:id
// @desc    Update subscription plan
// @access  Private/Admin
router.put(
  '/:id',
  [verifyAdminToken, ...subscriptionPlanValidation],
  subscriptionPlanController.updateSubscriptionPlan
);

// @route   DELETE /api/subscription-plans/:id
// @desc    Delete subscription plan
// @access  Private/Admin
router.delete('/:id', verifyAdminToken, subscriptionPlanController.deleteSubscriptionPlan);

module.exports = router;
