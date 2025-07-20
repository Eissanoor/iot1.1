/**
 * Service for cleaning up old data from all collections
 */

const Temperature = require('../models/temperatureData');
const SoilMoistureData = require('../models/soilMoistureData');
const { cleanupCollection } = require('../utils/cleanupUtils');

// Configuration for each collection
const cleanupConfig = {
  temperature: {
    model: Temperature,
    maxRecords: 80,  // Maximum records to keep
    deleteCount: 30  // Number of records to delete when threshold is reached
  },
  soilMoisture: {
    model: SoilMoistureData,
    maxRecords: 80,
    deleteCount: 30
  }
  // Add more collections here as needed
};

// Function to clean up all collections
const cleanupAllCollections = async () => {
  console.log('Starting scheduled cleanup of all collections...');
  
  const results = {};
  
  // Process each collection
  for (const [name, config] of Object.entries(cleanupConfig)) {
    try {
      const deletedCount = await cleanupCollection(
        config.model, 
        config.maxRecords, 
        config.deleteCount
      );
      
      results[name] = deletedCount;
    } catch (error) {
      console.error(`Error cleaning up ${name} collection:`, error);
      results[name] = -1; // Indicate error
    }
  }
  
  console.log('Cleanup complete. Results:', results);
  return results;
};

// Function to check if any collection needs aggressive cleanup (much larger than maxRecords)
const checkForLargeCollections = async () => {
  console.log('Checking for large collections that need aggressive cleanup...');
  
  const results = {};
  
  // Process each collection
  for (const [name, config] of Object.entries(cleanupConfig)) {
    try {
      const count = await config.model.countDocuments();
      
      // If collection is significantly larger than maxRecords (e.g., 50% more)
      if (count > config.maxRecords * 1.5) {
        console.log(`Collection ${name} has ${count} records, significantly exceeding limit of ${config.maxRecords}. Performing aggressive cleanup...`);
        
        // Calculate how many to delete to bring it down to maxRecords
        const aggressiveDeleteCount = count - config.maxRecords;
        
        // Perform aggressive cleanup
        const deletedCount = await cleanupCollection(
          config.model,
          config.maxRecords,
          aggressiveDeleteCount
        );
        
        results[name] = deletedCount;
      } else {
        results[name] = 0; // No aggressive cleanup needed
      }
    } catch (error) {
      console.error(`Error checking collection size for ${name}:`, error);
      results[name] = -1; // Indicate error
    }
  }
  
  console.log('Large collection check complete. Results:', results);
  return results;
};

// Function to run initial cleanup when server starts
const runInitialCleanup = async () => {
  console.log('Running initial cleanup check on server startup...');
  return await checkForLargeCollections();
};

module.exports = {
  cleanupAllCollections,
  cleanupConfig,
  checkForLargeCollections,
  runInitialCleanup
}; 