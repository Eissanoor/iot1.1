const { PrismaClient } = require('@prisma/client');

// Create a singleton instance of the Prisma client
const prisma = new PrismaClient();

module.exports = prisma; 