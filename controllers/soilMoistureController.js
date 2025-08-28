const SoilMoistureData = require('../models/soilMoistureData');

// Controller methods
exports.createData = async (req, res) => {
  try {
    const { moisture } = req.body;
    
    await SoilMoistureData.create({
      moisture: parseFloat(moisture)
    });
    
    res.status(201).json({ message: 'Soil moisture data saved successfully' });
  } catch (error) {
    console.error('Error saving soil moisture data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllData = async (req, res) => {
  try {
    // Get query parameters for filtering
    const limit = parseInt(req.query.limit) || 100; // Default to 100 records
    const skip = parseInt(req.query.skip) || 0;
    
    // Get data with pagination, sort by timestamp descending (newest first)
    const data = await SoilMoistureData.findMany({
      skip: skip,
      take: limit,
      orderBy: { timestamp: 'desc' }
    });
    
    // Get total count
    const count = await SoilMoistureData.count();
    
    res.status(200).json({
      count,
      data
    });
  } catch (error) {
    console.error('Error retrieving soil moisture data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLatestData = async (req, res) => {
  try {
    const latestData = await SoilMoistureData.findFirst({
      orderBy: { timestamp: 'desc' }
    });
      
    if (!latestData) {
      return res.status(404).json({ message: 'No soil moisture data found' });
    }
    
    res.status(200).json(latestData);
  } catch (error) {
    console.error('Error retrieving latest soil moisture data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 