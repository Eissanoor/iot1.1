const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SubscriptionPlan {
  async create(data) {
    return await prisma.subscriptionPlan.create({
      data
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
    return await prisma.subscriptionPlan.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return await prisma.subscriptionPlan.delete({
      where: { id }
    });
  }
}

module.exports = new SubscriptionPlan();
