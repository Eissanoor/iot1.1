const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

// Import Prisma client
const prisma = require('./prisma/client');

// Import controllers for cron jobs
const tempHumidityController = require('./controllers/temperatureHumidityController');
const soilMoistureController = require('./controllers/soilMoistureController');
const fuelLevelController = require('./controllers/fuelLevelController');
const vibrationSensorController = require('./controllers/vibrationSensorController');

// Import cleanup service
const { cleanupAllCollections, runInitialCleanup, checkForLargeCollections } = require('./services/cleanupService');

// Import routes
const temperatureRoutes = require('./routes/temperatureHumidityRoutes');
const soilMoistureRoutes = require('./routes/soilMoistureRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const fuelLevelRoutes = require('./routes/fuelLevelRoutes');
const assetRoutes = require('./routes/assetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const locationRoutes = require('./routes/locationRoutes');
const vibrationSensorRoutes = require('./routes/vibrationSensorRoutes');
const megaMenuRoutes = require('./routes/megaMenuRoutes');
const subMegaMenuRoutes = require('./routes/subMegaMenuRoutes');
const brandRoutes = require('./routes/brandRoutes');
const assetConditionRoutes = require('./routes/assetConditionRoutes');

const app = express();
const PORT = process.env.PORT || 2507;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Fuel level simulation variables
let currentFuelLevel = 100; // Starting at 100%
const fuelCapacity = 100;   // Maximum capacity
const fuelDecreaseRate = 0.5; // Decrease rate per interval

// Function to simulate decreasing fuel level
async function simulateFuelDecrease() {
  try {
    // Decrease fuel level by random amount between 0.1 and fuelDecreaseRate
    const decrease = Math.random() * fuelDecreaseRate + 0.1;
    currentFuelLevel = Math.max(0, currentFuelLevel - decrease);
    
    // Save the new fuel level to the database
    await prisma.fuelLevel.create({
      data: {
        level: currentFuelLevel,
        capacity: fuelCapacity
      }
    });
    
    console.log(`Fuel level updated: ${currentFuelLevel.toFixed(2)}%`);
    
    // If fuel level is low, log a warning
    if (currentFuelLevel < 20) {
      console.log('WARNING: Fuel level is low!');
    }
  } catch (error) {
    console.error('Error updating fuel level:', error);
  }
}

// Initialize server and connect to database
async function startServer() {
  try {
    // Connect to the database
    await prisma.$connect();
    console.log('Connected to SQL Server database');
    
    // Run initial cleanup on startup to handle existing large collections
    runInitialCleanup()
      .then(results => console.log('Initial cleanup completed:', results))
      .catch(error => console.error('Error in initial cleanup:', error));
    
    // Set up scenario change intervals
    setInterval(tempHumidityController.changeScenario, (Math.random() * 3 + 2) * 60 * 1000); // Change temp/humidity scenario every 2-5 minutes
    setInterval(soilMoistureController.changeScenario, (Math.random() * 5 + 5) * 60 * 1000); // Change soil moisture scenario every 5-10 minutes
    setInterval(vibrationSensorController.changeScenario, (Math.random() * 4 + 3) * 60 * 1000); // Change vibration scenario every 3-7 minutes

    // Schedule cron jobs to run
    cron.schedule('*/3 * * * * *', () => {
      tempHumidityController.saveSensorData();
    });

    cron.schedule('*/5 * * * * *', () => {
      soilMoistureController.saveSoilMoistureData();
    });

    // Schedule fuel level simulation every 10 seconds
    cron.schedule('*/10 * * * * *', () => {
      simulateFuelDecrease();
    });

    // Schedule vibration sensor simulation every 7 seconds
    cron.schedule('*/7 * * * * *', () => {
      vibrationSensorController.saveVibrationData();
    });

    // Schedule regular cleanup cron job to run every minute
    cron.schedule('* * * * *', () => {
      cleanupAllCollections()
        .then(results => console.log('Regular cleanup completed'))
        .catch(error => console.error('Error in regular cleanup:', error));
    });

    // Schedule aggressive cleanup check every 5 minutes
    // This will handle cases where collections grow rapidly
    cron.schedule('*/5 * * * *', () => {
      checkForLargeCollections()
        .then(results => console.log('Aggressive cleanup check completed'))
        .catch(error => console.error('Error in aggressive cleanup check:', error));
    });

    // API Routes
    app.use('/api/temperature', temperatureRoutes);
    app.use('/api/soil-moisture', soilMoistureRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/fuel-level', fuelLevelRoutes);
    app.use('/api/assets', assetRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/subcategories', subCategoryRoutes);
    app.use('/api/locations', locationRoutes);
    app.use('/api/vibration-sensor', vibrationSensorRoutes);
    app.use('/api/megamenu', megaMenuRoutes);
    app.use('/api/submegamenu', subMegaMenuRoutes);
    app.use('/api/brands', brandRoutes);
    app.use('/api/asset-conditions', assetConditionRoutes);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Cron jobs started - saving sensor data at regular intervals');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer()
  .catch(error => {
    console.error('Unhandled error during server startup:', error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});