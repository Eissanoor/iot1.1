require('dotenv').config();
const { MongoClient } = require('mongodb');
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

// Create interfaces for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize Prisma client
const prisma = new PrismaClient();

// Function to ask for MongoDB connection string
function askMongoDbUrl() {
  return new Promise((resolve) => {
    rl.question('Enter your MongoDB connection string (e.g., mongodb://localhost:27017/iot-sensor-data): ', (answer) => {
      resolve(answer);
    });
  });
}

// Function to confirm migration
function confirmMigration() {
  return new Promise((resolve) => {
    rl.question('This will migrate data from MongoDB to SQL Server. Continue? (y/n): ', (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Function to migrate temperature data
async function migrateTemperatureData(mongoClient) {
  console.log('Migrating temperature data...');
  
  const db = mongoClient.db();
  const temperatureCollection = db.collection('temperatures');
  
  // Get all temperature records from MongoDB
  const temperatureData = await temperatureCollection.find({}).toArray();
  
  console.log(`Found ${temperatureData.length} temperature records in MongoDB.`);
  
  if (temperatureData.length === 0) {
    console.log('No temperature data to migrate.');
    return 0;
  }
  
  // Transform data for Prisma
  const transformedData = temperatureData.map(record => ({
    temperature: record.temperature,
    humidity: record.humidity,
    timestamp: record.timestamp || new Date()
  }));
  
  // Insert data into SQL Server using Prisma
  const result = await prisma.temperature.createMany({
    data: transformedData,
    skipDuplicates: true
  });
  
  console.log(`Migrated ${result.count} temperature records to SQL Server.`);
  return result.count;
}

// Function to migrate soil moisture data
async function migrateSoilMoistureData(mongoClient) {
  console.log('Migrating soil moisture data...');
  
  const db = mongoClient.db();
  const soilMoistureCollection = db.collection('soilmoisturedatas');
  
  // Get all soil moisture records from MongoDB
  const soilMoistureData = await soilMoistureCollection.find({}).toArray();
  
  console.log(`Found ${soilMoistureData.length} soil moisture records in MongoDB.`);
  
  if (soilMoistureData.length === 0) {
    console.log('No soil moisture data to migrate.');
    return 0;
  }
  
  // Transform data for Prisma
  const transformedData = soilMoistureData.map(record => ({
    moisture: record.moisture,
    timestamp: record.timestamp || new Date()
  }));
  
  // Insert data into SQL Server using Prisma
  const result = await prisma.soilMoistureData.createMany({
    data: transformedData,
    skipDuplicates: true
  });
  
  console.log(`Migrated ${result.count} soil moisture records to SQL Server.`);
  return result.count;
}

// Main migration function
async function migrateData() {
  console.log('Data Migration: MongoDB to SQL Server');
  console.log('====================================');
  
  try {
    // Get MongoDB connection string
    const mongoUrl = await askMongoDbUrl();
    
    if (!mongoUrl) {
      console.error('MongoDB connection string is required.');
      process.exit(1);
    }
    
    // Confirm migration
    const confirmed = await confirmMigration();
    
    if (!confirmed) {
      console.log('Migration cancelled.');
      process.exit(0);
    }
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    console.log('Connected to MongoDB successfully.');
    
    // Migrate data
    const tempCount = await migrateTemperatureData(mongoClient);
    const soilCount = await migrateSoilMoistureData(mongoClient);
    
    // Summary
    console.log('\nMigration Summary:');
    console.log(`- Temperature records: ${tempCount}`);
    console.log(`- Soil moisture records: ${soilCount}`);
    console.log(`- Total records migrated: ${tempCount + soilCount}`);
    
    // Close connections
    await mongoClient.close();
    await prisma.$disconnect();
    
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    rl.close();
  }
}

// Run migration
migrateData(); 