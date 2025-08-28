const Temperature = require('../models/temperatureData');

// Controller methods
exports.createData = async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    
    await Temperature.create({
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity)
    });
    
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllData = async (req, res) => {
  try {
    // Get query parameters for filtering
    const limit = parseInt(req.query.limit) || 100; // Default to 100 records
    const skip = parseInt(req.query.skip) || 0;
    
    // Get data with pagination, sort by timestamp descending (newest first)
    const data = await Temperature.findMany({
      skip: skip,
      take: limit,
      orderBy: { timestamp: 'desc' }
    });
    
    // Get total count
    const count = await Temperature.count();
    
    res.status(200).json({
      count,
      data
    });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLatestData = async (req, res) => {
  try {
    const latestData = await Temperature.findFirst({
      orderBy: { timestamp: 'desc' }
    });
      
    if (!latestData) {
      return res.status(404).json({ message: 'No temperature data found' });
    }
    
    res.status(200).json(latestData);
  } catch (error) {
    console.error('Error retrieving latest data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 