const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');

// Export Prisma User model operations
module.exports = {
  create: async (data) => {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword
      }
    });
  },
  
  findByEmail: (email) => {
    return prisma.user.findUnique({
      where: { email }
    });
  },
  
  findByUsername: (username) => {
    return prisma.user.findUnique({
      where: { username }
    });
  },
  
  findById: (id) => {
    return prisma.user.findUnique({
      where: { id }
    });
  },
  
  // Verify password
  verifyPassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}; 