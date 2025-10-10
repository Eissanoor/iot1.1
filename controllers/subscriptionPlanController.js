const SubscriptionPlan = require('../models/subscriptionPlan');
const { validationResult } = require('express-validator');
const Joi = require('joi');
const createError = require('http-errors');

// Create a new subscription plan
exports.createSubscriptionPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, nameAr, displayName, displayNameAr, description, descriptionAr, price, billingCycle, isPopular, isActive } = req.body;

    // Check if plan with same name already exists
    const existingPlan = await SubscriptionPlan.findByName(name);
    if (existingPlan) {
      return res.status(400).json({ message: 'Subscription plan with this name already exists' });
    }

    const newPlan = await SubscriptionPlan.create({
      name,
      nameAr,
      displayName,
      displayNameAr,
      description,
      descriptionAr,
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
    // Check if member counts should be included
    const includeMemberCounts = req.query.includeMemberCounts === 'true';
    const { skip, take, isActive } = req.query;
    
    const prisma = require('../prisma/client');
    
    const plans = await prisma.subscriptionPlan.findMany({
      where: { 
        isActive: isActive !== undefined ? isActive === 'true' : true 
      },
      include: {
        plan_services: {
          where: { isIncluded: true },
          include: {
            service: true,
          },
        },
        // Conditionally include user subscriptions for counting
        ...(includeMemberCounts && {
          user_subscriptions: {
            where: {
              status: 'active', // Only count active subscriptions
            },
            select: {
              id: true, // We only need the count, so just select id
            },
          },
        }),
      },
      orderBy: { price: 'asc' },
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined
    });

    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      name_ar: plan.nameAr,
      display_name: plan.displayName,
      display_name_ar: plan.displayNameAr,
      description: plan.description,
      description_ar: plan.descriptionAr,
      price: plan.price,
      billing_cycle: plan.billingCycle,
      is_popular: plan.isPopular,
      services: plan.plan_services
        .filter(ps => ps.service?.is_active)
        .map(ps => ({
          id: ps.service.id,
          name: ps.service.display_name,
          name_ar: ps.service.name_ar,
          description: ps.service.description,
          description_ar: ps.service.description_ar,
          service_type: ps.service.service_type,
          icon: ps.service.icon,
        })),
      // Conditionally include member count
      ...(includeMemberCounts && {
        registeredMembers: plan.user_subscriptions?.length || 0,
      }),
    }));

    res.status(200).json({
      success: true,
      message: 'Subscription plans retrieved successfully',
      data: formattedPlans,
      meta: {
        total: plans.length
      }
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
    const includeMemberCounts = req.query.includeMemberCounts === 'true';
    
    const prisma = require('../prisma/client');
    
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        plan_services: {
          where: { isIncluded: true },
          include: {
            service: true,
          },
        },
        // Conditionally include user subscriptions for counting
        ...(includeMemberCounts && {
          user_subscriptions: {
            where: {
              status: 'active', // Only count active subscriptions
            },
            select: {
              id: true, // We only need the count, so just select id
            },
          },
        }),
      }
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    const formattedPlan = {
      id: plan.id,
      name: plan.name,
      name_ar: plan.nameAr,
      display_name: plan.displayName,
      display_name_ar: plan.displayNameAr,
      description: plan.description,
      description_ar: plan.descriptionAr,
      price: plan.price,
      billing_cycle: plan.billingCycle,
      is_popular: plan.isPopular,
      is_active: plan.isActive,
      services: plan.plan_services
        .filter(ps => ps.service?.is_active)
        .map(ps => ({
          id: ps.service.id,
          name: ps.service.display_name,
          name_ar: ps.service.name_ar,
          description: ps.service.description,
          description_ar: ps.service.description_ar,
          service_type: ps.service.service_type,
          icon: ps.service.icon,
        })),
      // Conditionally include member count
      ...(includeMemberCounts && {
        registeredMembers: plan.user_subscriptions?.length || 0,
      }),
    };

    res.status(200).json({
      success: true,
      message: 'Subscription plan retrieved successfully',
      data: formattedPlan
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
    const { name, nameAr, displayName, displayNameAr, description, descriptionAr, price, billingCycle, isPopular, isActive } = req.body;
    
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
    if (nameAr !== undefined) updateData.nameAr = nameAr;
    if (displayName) updateData.displayName = displayName;
    if (displayNameAr !== undefined) updateData.displayNameAr = displayNameAr;
    if (description !== undefined) updateData.description = description;
    if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr;
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
// Add a service to a subscription plan
exports.addPlanService = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { planId, serviceId, isIncluded } = req.body;

    // Check if the plan exists
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Check if the service is already added to the plan
    const prisma = require('../prisma/client');
    const existing = await prisma.planService.findUnique({
      where: {
        planId_serviceId: {
          planId: planId,
          serviceId: serviceId,
        },
      },
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Service already added to this plan'
      });
    }

    const added = await prisma.planService.create({
      data: {
        planId: planId,
        serviceId: serviceId,
        isIncluded: isIncluded !== undefined ? isIncluded : true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Service added to plan successfully',
      data: added
    });
  } catch (error) {
    console.error('Error adding service to plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove a service from a subscription plan
exports.removePlanService = async (req, res) => {
  try {
    const { planId, serviceId } = req.params;
    
    // Check if the plan-service relationship exists
    const prisma = require('../prisma/client');
    const existing = await prisma.planService.findUnique({
      where: {
        planId_serviceId: {
          planId: planId,
          serviceId: serviceId,
        },
      },
    });
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Service not found in this plan'
      });
    }

    // Remove the service from the plan
    await prisma.planService.delete({
      where: {
        planId_serviceId: {
          planId: planId,
          serviceId: serviceId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Service removed from plan successfully'
    });
  } catch (error) {
    console.error('Error removing service from plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all services for a specific plan
exports.getPlanServices = async (req, res) => {
  try {
    const { planId } = req.params;
    
    // Check if plan exists
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }
    
    // Get all services for the plan
    const prisma = require('../prisma/client');
    const planServices = await prisma.planService.findMany({
      where: {
        planId: planId
      },
      include: {
        service: true
      }
    });

    res.status(200).json({
      success: true,
      data: planServices,
      meta: {
        total: planServices.length
      }
    });
  } catch (error) {
    console.error('Error fetching plan services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
