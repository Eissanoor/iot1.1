const SoilMoistureData = require('../models/soilMoistureData');

// Initial base value for soil moisture
let baseMoisture = 65.0; // Starting at 65% (moderate moisture)
let counter = 0;         // Counter for time-based patterns

// Soil moisture scenarios
const scenarios = {
  normal: { moisture: 0 },
  dry: { moisture: -15 },
  wet: { moisture: 15 },
  veryDry: { moisture: -25 },
  saturated: { moisture: 25 }
};

// Current scenario (starts with normal)
let currentScenario = 'normal';

// Randomly change scenario occasionally
const changeScenario = () => {
  const scenarioKeys = Object.keys(scenarios);
  currentScenario = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)];
  console.log(`Soil moisture scenario changed to: ${currentScenario}`);
};

// Function to generate realistic soil moisture data with patterns
const generateSoilMoistureData = () => {
  counter++;
  
  // Add time-based patterns (slight sine wave pattern with longer period)
  const timePattern = Math.sin(counter / 30) * 2; // Sine wave with longer period
  
  // Small random fluctuations (-0.4 to +0.4)
  const moistureChange = (Math.random() - 0.5) * 0.8;
  
  // Get current scenario modifiers
  const scenarioEffect = scenarios[currentScenario];
  
  // Update base values with combined changes
  baseMoisture = baseMoisture + moistureChange + timePattern * 0.2;
  
  // Apply scenario effect
  const targetMoisture = 65 + scenarioEffect.moisture;
  
  // Gradually move toward scenario values (5% adjustment per reading - soil changes more slowly)
  baseMoisture = baseMoisture * 0.95 + targetMoisture * 0.05;
  
  // Keep values within realistic ranges
  baseMoisture = Math.max(10, Math.min(95, baseMoisture));
  
  return {
    moisture: parseFloat(baseMoisture.toFixed(2))
  };
};

// Function to save soil moisture data
const saveSoilMoistureData = async () => {
  try {
    const { moisture } = generateSoilMoistureData();
    
    await SoilMoistureData.create({
      moisture
    });
    
    console.log(`Data saved: Soil Moisture: ${moisture}%`);
  } catch (error) {
    console.error('Error saving soil moisture data:', error);
  }
};

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

// Export functions for use in cron jobs
exports.generateSoilMoistureData = generateSoilMoistureData;
exports.saveSoilMoistureData = saveSoilMoistureData;
exports.changeScenario = changeScenario; 