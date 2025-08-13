const SubscriptionPlan = require('../models/subscriptionPlan');
const { validationResult } = require('express-validator');

// Create a new subscription plan
exports.createSubscriptionPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, displayName, description, price, billingCycle, isPopular, isActive } = req.body;

    // Check if plan with same name already exists
    const existingPlan = await SubscriptionPlan.findByName(name);
    if (existingPlan) {
      return res.status(400).json({ message: 'Subscription plan with this name already exists' });
    }

    const newPlan = await SubscriptionPlan.create({
      name,
      displayName,
      description,
      price: parseFloat(price),
      billingCycle,
      isPopular: isPopular || false,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      data: newPlan
    });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all subscription plans
exports.getAllSubscriptionPlans = async (req, res) => {
  try {
    const { skip, take, isActive } = req.query;
    
    const query = {
      skip,
      take,
      where: {}
    };
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      query.where.isActive = isActive === 'true';
    }

    const result = await SubscriptionPlan.findAll(query);

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get subscription plan by ID
exports.getSubscriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = await SubscriptionPlan.findById(id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update subscription plan
exports.updateSubscriptionPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, displayName, description, price, billingCycle, isPopular, isActive } = req.body;
    
    // Check if plan exists
    const existingPlan = await SubscriptionPlan.findById(id);
    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }
    
    // If name is being changed, check if the new name already exists
    if (name && name !== existingPlan.name) {
      const planWithSameName = await SubscriptionPlan.findByName(name);
      if (planWithSameName) {
        return res.status(400).json({
          success: false,
          message: 'Subscription plan with this name already exists'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (displayName) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (billingCycle) updateData.billingCycle = billingCycle;
    if (isPopular !== undefined) updateData.isPopular = isPopular;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPlan = await SubscriptionPlan.update(id, updateData);

    res.status(200).json({
      success: true,
      data: updatedPlan
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete subscription plan
exports.deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if plan exists
    const existingPlan = await SubscriptionPlan.findById(id);
    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    await SubscriptionPlan.delete(id);

    res.status(200).json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
