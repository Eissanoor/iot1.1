const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Import Prisma client
const prisma = require('./prisma/client');

// Import controllers for cron jobs
const tempHumidityController = require('./controllers/temperatureHumidityController');
const soilMoistureController = require('./controllers/soilMoistureController');

// Import cleanup service
const { cleanupAllCollections, runInitialCleanup, checkForLargeCollections } = require('./services/cleanupService');

// Import routes
const temperatureRoutes = require('./routes/temperatureHumidityRoutes');
const soilMoistureRoutes = require('./routes/soilMoistureRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 2507;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

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

    // Schedule cron jobs to run
    cron.schedule('*/3 * * * * *', () => {
      tempHumidityController.saveSensorData();
    });

    cron.schedule('*/5 * * * * *', () => {
      soilMoistureController.saveSoilMoistureData();
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