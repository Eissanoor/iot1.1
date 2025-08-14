const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Page {
  async create(data) {
    return await prisma.newPage.create({
      data,
      include: {
        sections: {
          include: {
            contents: true,
          },
        },
      },
    });
  }

  async findAll(query = {}) {
    const { skip, take, where = {}, orderBy = { updated_at: 'desc' } } = query;
    
    const options = {
      where,
      orderBy
    };

    if (skip) options.skip = parseInt(skip);
    if (take) options.take = parseInt(take);

    const [data, total] = await Promise.all([
      prisma.newPage.findMany(options),
      prisma.newPage.count({ where })
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
    return await prisma.newPage.findUnique({
      where: { id },
      include: {
        template: true,
        sections: {
          orderBy: {
            order: 'asc',
          },
          include: {
            contents: true,
          },
        },
      },
    });
  }

  async findBySlug(slug) {
    return await prisma.newPage.findUnique({
      where: { slug },
      include: {
        template: true,
        sections: {
          orderBy: {
            order: 'asc',
          },
          include: {
            contents: true,
          },
        },
      },
    });
  }

  async update(id, data) {
    return await prisma.newPage.update({
      where: { id },
      data,
      include: {
        sections: {
          include: {
            contents: true,
          },
        },
      },
    });
  }

  async delete(id) {
    return await prisma.newPage.delete({
      where: { id }
    });
  }

  async findTemplates(query = {}) {
    const { where = {}, orderBy = { updated_at: 'desc' } } = query;
    
    return await prisma.template.findMany({
      where,
      orderBy
    });
  }
}

module.exports = new Page();
