const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SubscriptionPlan {
  async create(data) {
    // Convert camelCase to snake_case for database fields
    const dbData = {
      name: data.name,
      name_ar: data.nameAr,
      displayName: data.displayName,
      displayNameAr: data.displayNameAr,
      description: data.description,
      descriptionAr: data.descriptionAr,
      price: data.price,
      billingCycle: data.billingCycle,
      isPopular: data.isPopular,
      isActive: data.isActive
    };
    
    return await prisma.subscriptionPlan.create({
      data: dbData
    });
  }

  async findAll(query = {}) {
    const { skip, take, where = {}, orderBy = { createdAt: 'desc' } } = query;
    
    const options = {
      where,
      orderBy
    };

    if (skip) options.skip = parseInt(skip);
    if (take) options.take = parseInt(take);

    const [data, total] = await Promise.all([
      prisma.subscriptionPlan.findMany(options),
      prisma.subscriptionPlan.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        skip: skip ? parseInt(skip) : 0,
        take: take ? parseInt(take) : total
      }
    };
  }

  async findById(id) {
    return await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        plan_services: {
          include: {
            service: true
          }
        }
      }
    });
  }

  async findByName(name) {
    return await prisma.subscriptionPlan.findUnique({
      where: { name }
    });
  }

  async update(id, data) {
    // Convert camelCase to snake_case for database fields
    const dbData = {};
    
    if (data.name !== undefined) dbData.name = data.name;
    if (data.nameAr !== undefined) dbData.name_ar = data.nameAr;
    if (data.displayName !== undefined) dbData.displayName = data.displayName;
    if (data.displayNameAr !== undefined) dbData.displayNameAr = data.displayNameAr;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.descriptionAr !== undefined) dbData.descriptionAr = data.descriptionAr;
    if (data.price !== undefined) dbData.price = data.price;
    if (data.billingCycle !== undefined) dbData.billingCycle = data.billingCycle;
    if (data.isPopular !== undefined) dbData.isPopular = data.isPopular;
    if (data.isActive !== undefined) dbData.isActive = data.isActive;
    
    return await prisma.subscriptionPlan.update({
      where: { id },
      data: dbData
    });
  }

  async delete(id) {
    return await prisma.subscriptionPlan.delete({
      where: { id }
    });
  }
}

module.exports = new SubscriptionPlan();
