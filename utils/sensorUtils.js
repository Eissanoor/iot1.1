/**
 * Utility functions for sensor data operations
 */

// Generate a random value within a range
exports.getRandomValue = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Generate a random fluctuation around a base value
exports.generateFluctuation = (baseValue, fluctuationRange) => {
  const fluctuation = (Math.random() - 0.5) * 2 * fluctuationRange;
  return baseValue + fluctuation;
};

// Apply sine wave pattern to simulate natural cycles
exports.applySineWavePattern = (counter, period, amplitude) => {
  return Math.sin(counter / period) * amplitude;
};

// Keep a value within specified bounds
exports.clampValue = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

// Format a number to specified decimal places
exports.formatValue = (value, decimalPlaces = 2) => {
  return parseFloat(value.toFixed(decimalPlaces));
};

// Calculate fuel consumption rate based on various factors
exports.calculateFuelConsumptionRate = (baseRate, load, temperature) => {
  // Higher load and temperature increase fuel consumption
  const loadFactor = 1 + (load / 100) * 0.5;  // Load can increase consumption by up to 50%
  const tempFactor = 1 + Math.max(0, (temperature - 20) / 100);  // Higher temps increase consumption
  
  return baseRate * loadFactor * tempFactor;
};

// Calculate remaining time based on current fuel level and consumption rate
exports.calculateRemainingTime = (currentLevel, capacity, consumptionRate) => {
  if (consumptionRate <= 0) return Infinity;
  
  const fuelAmount = (currentLevel / 100) * capacity; // Convert percentage to actual amount
  const timeRemaining = fuelAmount / consumptionRate; // Time in hours
  
  return timeRemaining;
};

// Format remaining time into human-readable format
exports.formatRemainingTime = (timeInHours) => {
  if (timeInHours === Infinity) return 'Unlimited';
  
  const hours = Math.floor(timeInHours);
  const minutes = Math.floor((timeInHours - hours) * 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}; 