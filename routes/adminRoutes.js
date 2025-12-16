const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');

// Sensor models
const Temperature = require('../models/temperatureData');
const SoilMoisture = require('../models/soilMoistureData');
const FuelLevel = require('../models/fuelLevelData');
const VibrationSensor = require('../models/vibrationSensorData');
const NPKSensor = require('../models/npkSensorData');
const { runDatabaseBackup } = require('../services/backupService');

// Collection configuration
const collectionsConfig = {
  temperature: {
    model: Temperature,
    name: 'Temperature',
    maxRecords: 100
  },
  soilMoisture: {
    model: SoilMoisture,
    name: 'SoilMoistureData',
    maxRecords: 100
  },
  fuelLevel: {
    model: FuelLevel,
    name: 'FuelLevel',
    maxRecords: 100
  },
  vibrationSensor: {
    model: VibrationSensor,
    name: 'VibrationSensor',
    maxRecords: 100
  },
  npkSensor: {
    model: NPKSensor,
    name: 'NPKSensor',
    maxRecords: 100
  }
};

// Helper function to clean up a collection
const cleanupCollection = async (model, maxRecords) => {
  try {
    // Count documents in the collection
    const count = await model.count();
    
    // Check if cleanup is needed
    if (count > maxRecords) {
      console.log(`Collection ${model.constructor.name} has ${count} records, exceeding limit of ${maxRecords}. Cleaning up...`);
      
      // Calculate how many records to delete
      const deleteCount = count - maxRecords;
      
      // Delete oldest records
      const result = await model.deleteOldest(deleteCount);
      
      return {
        deletedCount: result.count,
        remainingCount: count - result.count
      };
    }
    
    return {
      deletedCount: 0,
      remainingCount: count
    };
  } catch (error) {
    console.error(`Error cleaning up collection:`, error);
    throw error;
  }
};

// Route to manually trigger cleanup of all collections
router.post('/cleanup', async (req, res) => {
  try {
    const results = {};
    
    for (const [key, config] of Object.entries(collectionsConfig)) {
      try {
        results[key] = await cleanupCollection(config.model, config.maxRecords);
      } catch (error) {
        results[key] = { error: error.message };
      }
    }
    
    res.status(200).json({
      message: 'Cleanup process completed successfully',
      results
    });
  } catch (error) {
    console.error('Error during manual cleanup:', error);
    res.status(500).json({ error: 'Error during cleanup process' });
  }
});

// Route to get collection sizes
router.get('/collections/size', async (req, res) => {
  try {
    const sizes = {};
    
    for (const [key, config] of Object.entries(collectionsConfig)) {
      const count = await config.model.count();
      sizes[key] = {
        collection: config.name,
        count,
        maxRecords: config.maxRecords,
        status: count > config.maxRecords ? 'exceeds limit' : 'within limit'
      };
    }
    
    res.status(200).json(sizes);
  } catch (error) {
    console.error('Error getting collection sizes:', error);
    res.status(500).json({ error: 'Error getting collection sizes' });
  }
});

// Route to get cleanup configuration
router.get('/cleanup/config', (req, res) => {
  // Convert models to collection names for the response
  const configInfo = {};
  
  for (const [key, config] of Object.entries(collectionsConfig)) {
    configInfo[key] = {
      collection: config.name,
      maxRecords: config.maxRecords
    };
  }
  
  res.status(200).json(configInfo);
});

// Route to update cleanup configuration
router.put('/cleanup/config', async (req, res) => {
  try {
    const { collection, maxRecords } = req.body;
    
    // Find the configuration for the specified collection
    let found = false;
    for (const [key, config] of Object.entries(collectionsConfig)) {
      if (config.name === collection) {
        // Update configuration
        if (maxRecords !== undefined) config.maxRecords = parseInt(maxRecords);
        found = true;
        break;
      }
    }
    
    if (!found) {
      return res.status(404).json({ error: `Collection '${collection}' not found in cleanup configuration` });
    }
    
    res.status(200).json({ 
      message: `Cleanup configuration for '${collection}' updated successfully` 
    });
  } catch (error) {
    console.error('Error updating cleanup configuration:', error);
    res.status(500).json({ error: 'Error updating cleanup configuration' });
  }
});

// Route to trigger an immediate database backup
router.post('/backup/run', async (req, res) => {
  try {
    const result = await runDatabaseBackup();
    if (result?.skipped) {
      return res.status(200).json({
        message: 'Backup skipped',
        reason: result.reason || 'disabled',
      });
    }

    return res.status(200).json({
      message: 'Backup completed',
      backupFileName: result.backupFileName,
      backupPath: result.backupPath,
      driveFile: result.driveFile,
    });
  } catch (error) {
    console.error('Error running manual backup:', error);
    res.status(500).json({ error: 'Backup failed', details: error.message });
  }
});

module.exports = router;