const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');

// User model methods
class User {
  // Find user by email
  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }
  
  // Find user by username
  static async findByUsername(username) {
    return await prisma.user.findUnique({
      where: { username }
    });
  }
  
  // Find user by NFC number
  static async findByNfcNumber(nfcNumber) {
    return await prisma.user.findFirst({
      where: { 
        nfcNumber,
        isNfcEnable: true
      }
    });
  }
  
  // Find user by ID
  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id: id }
    });
  }
  
  // Create new user
  static async create({ email, username, password, isNfcEnable = false, nfcNumber = null }) {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    return await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        isNfcEnable,
        nfcNumber
      }
    });
  }
  
  // Update user by ID
  static async updateById(id, data) {
    return await prisma.user.update({
      where: { id: id },
      data
    });
  }
  
  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User; 