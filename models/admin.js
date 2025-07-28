const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');

// Admin model methods
class Admin {
  // Find admin by email
  static async findByEmail(email) {
    return await prisma.admin.findUnique({
      where: { email }
    });
  }
  
  // Find admin by username
  static async findByUsername(username) {
    return await prisma.admin.findUnique({
      where: { username }
    });
  }
  
  // Find admin by ID
  static async findById(id) {
    return await prisma.admin.findUnique({
      where: { id: parseInt(id) }
    });
  }
  
  // Create new admin
  static async create({ email, username, password }) {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin
    return await prisma.admin.create({
      data: {
        email,
        username,
        password: hashedPassword
      }
    });
  }
  
  // Update admin by ID
  static async updateById(id, data) {
    return await prisma.admin.update({
      where: { id: parseInt(id) },
      data
    });
  }
  
  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Admin; 