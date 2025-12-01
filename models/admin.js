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
  static async create({ email, username, password, fullName, roleId, departmentId, status }) {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin
    return await prisma.admin.create({
      data: {
        email,
        username,
        password: hashedPassword,
        fullName: fullName || null,
        roleId: roleId ? parseInt(roleId) : null,
        departmentId: departmentId ? parseInt(departmentId) : null,
        status: status || 'inactive'
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

  // Set login OTP details
  static async setLoginOtp(adminId, otp, expiresAt) {
    return prisma.admin.update({
      where: { id: adminId },
      data: {
        loginOtp: otp,
        loginOtpExpiresAt: expiresAt,
        loginOtpAttempts: 0
      }
    });
  }

  // Clear login OTP details
  static async clearLoginOtp(adminId) {
    return prisma.admin.update({
      where: { id: adminId },
      data: {
        loginOtp: null,
        loginOtpExpiresAt: null,
        loginOtpAttempts: 0
      }
    });
  }

  // Increment OTP attempts counter
  static async incrementOtpAttempts(adminId) {
    return prisma.admin.update({
      where: { id: adminId },
      data: {
        loginOtpAttempts: {
          increment: 1
        }
      }
    });
  }
  
  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Admin; 