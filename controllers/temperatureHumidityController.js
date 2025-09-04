const Temperature = require('../models/temperatureData');

// Maximum number of records to keep in the database
const MAX_RECORDS = 100;

// Controller methods
exports.createData = async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    
    // First create the new record
    await Temperature.create({
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity)
    });
    
    // Check if we need to clean up old records
    const count = await Temperature.count();
    if (count > MAX_RECORDS) {
      // Calculate how many records to delete
      const deleteCount = count - MAX_RECORDS;
      
      // Delete oldest records
      await Temperature.deleteOldest(deleteCount);
      console.log(`Deleted ${deleteCount} oldest temperature records to maintain limit of ${MAX_RECORDS}`);
    }
    
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

exports.getStats = async (req, res) => {
  try {
    // Get time range from query parameters (default to last 24 hours)
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Get aggregated data
    const stats = await Temperature.getStats(since);
    
    if (!stats || !stats.length) {
      return res.status(404).json({ message: 'No temperature data found for the specified period' });
    }
    
    // Calculate min, max, avg values
    const result = {
      temperature: {
        current: stats[0].temperature,
        min: Math.min(...stats.map(d => d.temperature)),
        max: Math.max(...stats.map(d => d.temperature)),
        avg: parseFloat((stats.reduce((sum, d) => sum + d.temperature, 0) / stats.length).toFixed(1))
      },
      humidity: {
        current: stats[0].humidity,
        min: Math.min(...stats.map(d => d.humidity)),
        max: Math.max(...stats.map(d => d.humidity)),
        avg: parseFloat((stats.reduce((sum, d) => sum + d.humidity, 0) / stats.length).toFixed(1))
      },
      // Calculate percentage change compared to average
      trends: {
        temperature: parseFloat(((stats[0].temperature - stats[stats.length-1].temperature) / stats[stats.length-1].temperature * 100).toFixed(1)),
        humidity: parseFloat(((stats[0].humidity - stats[stats.length-1].humidity) / stats[stats.length-1].humidity * 100).toFixed(1))
      }
    };
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getHistoricalData = async (req, res) => {
  try {
    // Get time range from query parameters
    const days = parseInt(req.query.days) || 7; // Default to 7 days
    const interval = req.query.interval || 'hour'; // 'hour', 'day'
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Get historical data
    const data = await Temperature.getHistorical(since, interval);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error retrieving historical data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTrends = async (req, res) => {
  try {
    // Get period from query parameters (default to 12M)
    const period = req.query.period || '12M';
    const type = req.query.type || 'both'; // 'temperature', 'humidity', or 'both'
    
    // Validate period parameter
    const validPeriods = ['12M', '6M', '30D', '7D'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ 
        error: 'Invalid period parameter', 
        message: 'Period must be one of: 12M, 6M, 30D, 7D' 
      });
    }
    
    // Get trend data
    const data = await Temperature.getTrends(period);
    
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No trend data found for the specified period' });
    }
    
    // Format response based on type
    let response;
    
    if (type === 'temperature') {
      response = {
        period,
        data: data.map(item => ({
          label: item.month || item.day,
          value: item.temperature
        }))
      };
    } else if (type === 'humidity') {
      response = {
        period,
        data: data.map(item => ({
          label: item.month || item.day,
          value: item.humidity
        }))
      };
    } else {
      // Both temperature and humidity
      response = {
        period,
        temperature: data.map(item => ({
          label: item.month || item.day,
          value: item.temperature
        })),
        humidity: data.map(item => ({
          label: item.month || item.day,
          value: item.humidity
        }))
      };
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving trend data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};