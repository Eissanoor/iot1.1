/**
 * Utility functions for cleaning up old data from collections
 */

// Function to delete oldest records when collection size exceeds a threshold
exports.cleanupCollection = async (model, maxRecords, deleteCount) => {
  try {
    // Count documents in the collection
    const count = await model.countDocuments();
    
    // Check if cleanup is needed
    if (count > maxRecords) {
      console.log(`Collection ${model.collection.name} has ${count} records, exceeding limit of ${maxRecords}. Cleaning up...`);
      
      // Calculate how many records to delete - ensure we don't leave less than maxRecords
      // For large collections, delete more records to bring it down to maxRecords
      const actualDeleteCount = Math.max(deleteCount, count - maxRecords);
      
      console.log(`Will delete ${actualDeleteCount} records from ${model.collection.name}`);
      
      // Find the oldest records to delete
      const oldestRecords = await model
        .find({})
        .sort({ timestamp: 1 }) // Sort by timestamp ascending (oldest first)
        .limit(actualDeleteCount);
      
      // Get IDs of records to delete
      const idsToDelete = oldestRecords.map(record => record._id);
      
      // Delete the records
      const deleteResult = await model.deleteMany({ _id: { $in: idsToDelete } });
      
      console.log(`Deleted ${deleteResult.deletedCount} old records from ${model.collection.name}`);
      return deleteResult.deletedCount;
    } else {
      // No cleanup needed
      return 0;
    }
  } catch (error) {
    console.error(`Error cleaning up collection ${model.collection.name}:`, error);
    return 0;
  }
}; 