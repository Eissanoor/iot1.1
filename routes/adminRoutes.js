const express = require('express');
const router = express.Router();
const { cleanupAllCollections, cleanupConfig, checkForLargeCollections } = require('../services/cleanupService');
const prisma = require('../prisma/client');

// Route to manually trigger cleanup of all collections
router.post('/cleanup', async (req, res) => {
  try {
    const results = await cleanupAllCollections();
    res.status(200).json({
      message: 'Cleanup process completed successfully',
      results
    });
  } catch (error) {
    console.error('Error during manual cleanup:', error);
    res.status(500).json({ error: 'Error during cleanup process' });
  }
});

// Route to manually trigger aggressive cleanup for large collections
router.post('/cleanup/force', async (req, res) => {
  try {
    const results = await checkForLargeCollections();
    res.status(200).json({
      message: 'Aggressive cleanup process completed successfully',
      results
    });
  } catch (error) {
    console.error('Error during aggressive cleanup:', error);
    res.status(500).json({ error: 'Error during aggressive cleanup process' });
  }
});

// Route to get collection sizes
router.get('/collections/size', async (req, res) => {
  try {
    const sizes = {};
    
    for (const [key, config] of Object.entries(cleanupConfig)) {
      const count = await config.model.count();
      sizes[key] = {
        collection: config.model.modelName,
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
  
  for (const [key, config] of Object.entries(cleanupConfig)) {
    configInfo[key] = {
      collection: config.model.modelName,
      maxRecords: config.maxRecords,
      deleteCount: config.deleteCount
    };
  }
  
  res.status(200).json(configInfo);
});

// Route to update cleanup configuration
router.put('/cleanup/config', async (req, res) => {
  try {
    const { collection, maxRecords, deleteCount } = req.body;
    
    // Find the configuration for the specified collection
    let found = false;
    for (const [key, config] of Object.entries(cleanupConfig)) {
      if (config.model.modelName === collection) {
        // Update configuration
        if (maxRecords !== undefined) config.maxRecords = parseInt(maxRecords);
        if (deleteCount !== undefined) config.deleteCount = parseInt(deleteCount);
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

module.exports = router; 