const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

// Sample users to seed
const users = [
  {
    email: 'admin@example.com',
    username: 'admin',
    password: 'admin123'
  },
  {
    email: 'user@example.com',
    username: 'user',
    password: 'user123'
  },
  {
    email: 'test@example.com',
    username: 'test',
    password: 'test123'
  }
];

// Seed the database with users
async function seedUsers() {
  try {
    console.log('Seeding users...');
    
    // Hash passwords and create users
    for (const user of users) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      });
      
      if (existingUser) {
        console.log(`User with email ${user.email} already exists, skipping...`);
        continue;
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Create the user
      await prisma.user.create({
        data: {
          email: user.email,
          username: user.username,
          password: hashedPassword
        }
      });
      
      console.log(`Created user: ${user.username} (${user.email})`);
    }
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`Total users in database: ${userCount}`);
    
    console.log('User seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedUsers(); 