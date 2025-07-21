const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Successfully connected to the database!');
    
    // Test query to verify schema
    console.log('Testing Temperature table...');
    const tempCount = await prisma.temperature.count();
    console.log(`Temperature records: ${tempCount}`);
    
    console.log('Testing SoilMoistureData table...');
    const soilCount = await prisma.soilMoistureData.count();
    console.log(`Soil Moisture records: ${soilCount}`);
    
    console.log('Database connection and schema test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 