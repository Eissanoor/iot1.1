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