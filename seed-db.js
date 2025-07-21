const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Function to generate random temperature and humidity data
function generateTemperatureData(count) {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Generate data points with timestamps going back in time
    const timestamp = new Date(now.getTime() - (i * 60000)); // 1 minute apart
    
    data.push({
      temperature: parseFloat((Math.random() * 10 + 20).toFixed(2)), // 20-30°C
      humidity: parseFloat((Math.random() * 20 + 50).toFixed(2)),    // 50-70%
      timestamp
    });
  }
  
  return data;
}

// Function to generate random soil moisture data
function generateSoilMoistureData(count) {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Generate data points with timestamps going back in time
    const timestamp = new Date(now.getTime() - (i * 60000)); // 1 minute apart
    
    data.push({
      moisture: parseFloat((Math.random() * 30 + 40).toFixed(2)), // 40-70%
      timestamp
    });
  }
  
  return data;
}

// Seed the database
async function seedDatabase() {
  try {
    console.log('Seeding database with test data...');
    
    // Generate test data
    const temperatureData = generateTemperatureData(50);
    const soilMoistureData = generateSoilMoistureData(50);
    
    // Insert temperature data
    console.log('Inserting temperature data...');
    await prisma.temperature.createMany({
      data: temperatureData
    });
    
    // Insert soil moisture data
    console.log('Inserting soil moisture data...');
    await prisma.soilMoistureData.createMany({
      data: soilMoistureData
    });
    
    // Verify data was inserted
    const tempCount = await prisma.temperature.count();
    const soilCount = await prisma.soilMoistureData.count();
    
    console.log(`✅ Seeding completed successfully!`);
    console.log(`Temperature records: ${tempCount}`);
    console.log(`Soil Moisture records: ${soilCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDatabase(); 