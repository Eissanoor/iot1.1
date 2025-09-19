const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Import Prisma client
const prisma = require('./prisma/client');


// Import routes
const temperatureRoutes = require('./routes/temperatureHumidityRoutes');
const soilMoistureRoutes = require('./routes/soilMoistureRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminDemoRequestRoutes = require('./routes/adminDemoRequestRoutes');
const authRoutes = require('./routes/authRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
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
const employeeListRoutes = require('./routes/employeeListRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const npkSensorRoutes = require('./routes/npkSensorRoutes');
const deviceCategoryRoutes = require('./routes/deviceCategoryRoutes');
const iotDeviceRoutes = require('./routes/iotDeviceRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const subscriptionPlanRoutes = require('./routes/subscriptionPlanRoutes');
const pageRoutes = require('./routes/pageRoutes');
const firstContainerRoutes = require('./routes/firstContainerRoutes');
const secondContainerRoutes = require('./routes/secondContainerRoutes');
const thirdContainerRoutes = require('./routes/thirdContainerRoutes');
const fourthContainerRoutes = require('./routes/fourthContainerRoutes');
const commentRoutes = require('./routes/commentRoutes');
const headerRoutes = require('./routes/headerRoutes');
const demoRequestRoutes = require('./routes/demoRequestRoutes');
const languagesRoutes = require('./routes/languagesRoutes');
const gasDetectionRoutes = require('./routes/gasDetectionRoutes');
const carDetectionRoutes = require('./routes/carDetectionRoutes');
const rainStatusRoutes = require('./routes/rainStatusRoutes');
const faqRoutes = require('./routes/faqRoutes');
const motionDetectionRoutes = require('./routes/motionDetectionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Initialize Express app
const app = express();

// Set port
const PORT = process.env.PORT || 2507;

// Enable gzip compression for all responses
app.use(compression({
  // Compress responses with these MIME types
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  // Compression level (1-9, 6 is default)
  level: 6,
  // Only compress responses larger than this threshold (in bytes)
  threshold: 1024
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure CORS
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add a simple request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Initialize server and connect to database
async function startServer() {
  try {
    // Connect to the database
    await prisma.$connect();
    console.log('Connected to SQL Server database');
    
    // API Routes
    app.use('/api/temperature', temperatureRoutes);
    app.use('/api/soil-moisture', soilMoistureRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/admin', adminDemoRequestRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/admin-auth', adminAuthRoutes);
    app.use('/api/fuel-level', fuelLevelRoutes);
    app.use('/api/assets', assetRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/subcategories', subCategoryRoutes);
    app.use('/api/locations', locationRoutes);
    app.use('/api/vibration', vibrationSensorRoutes);
    app.use('/api/megamenu', megaMenuRoutes);
    app.use('/api/submegamenu', subMegaMenuRoutes);
    app.use('/api/brands', brandRoutes);
    app.use('/api/asset-conditions', assetConditionRoutes);
    app.use('/api/employees', employeeListRoutes);
    app.use('/api/departments', departmentRoutes);
    app.use('/api/npk', npkSensorRoutes);
    app.use('/api/device-categories', deviceCategoryRoutes);
    app.use('/api/iot-devices', iotDeviceRoutes);
    app.use('/api/services', serviceRoutes);
    app.use('/api/subscription-plans', subscriptionPlanRoutes);
    app.use('/api/pages', pageRoutes);
    app.use('/api/first-containers', firstContainerRoutes);
    app.use('/api/second-containers', secondContainerRoutes);
    app.use('/api/third-containers', thirdContainerRoutes);
    app.use('/api/fourth-containers', fourthContainerRoutes);
    app.use('/api/comments', commentRoutes);
    app.use('/api/headers', headerRoutes);
    app.use('/api/demo-requests', demoRequestRoutes);
    app.use('/api/languages', languagesRoutes);
    app.use('/api/gas-detection', gasDetectionRoutes);
    app.use('/api/car-detection', carDetectionRoutes);
    app.use('/api/rain-status', rainStatusRoutes);
    app.use('/api/faqs', faqRoutes);
    app.use('/api/motion-detection', motionDetectionRoutes);
    app.use('/api/dashboard', dashboardRoutes);

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();