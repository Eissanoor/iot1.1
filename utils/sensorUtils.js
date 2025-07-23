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

// Vibration sensor utility functions

// Generate vibration data with realistic patterns
exports.generateVibrationData = (baseAmplitude, baseFrequency, loadFactor = 1.0) => {
  // Apply load factor to base values
  const adjustedAmplitude = baseAmplitude * loadFactor;
  const adjustedFrequency = baseFrequency * (0.9 + loadFactor * 0.2); // Frequency increases slightly with load
  
  // Add random variations
  const amplitude = this.generateFluctuation(adjustedAmplitude, adjustedAmplitude * 0.2);
  const frequency = this.generateFluctuation(adjustedFrequency, adjustedFrequency * 0.1);
  
  // Generate axis values with some correlation but also independence
  const axisX = amplitude * this.getRandomValue(0.6, 1.4);
  const axisY = amplitude * this.getRandomValue(0.6, 1.4);
  const axisZ = amplitude * this.getRandomValue(0.6, 1.4);
  
  // Calculate RMS value
  const rms = Math.sqrt((axisX * axisX + axisY * axisY + axisZ * axisZ) / 3);
  
  // Calculate peak value
  const peakValue = Math.max(axisX, axisY, axisZ);
  
  return {
    amplitude: this.formatValue(amplitude, 3),
    frequency: this.formatValue(frequency, 2),
    axisX: this.formatValue(axisX, 3),
    axisY: this.formatValue(axisY, 3),
    axisZ: this.formatValue(axisZ, 3),
    rms: this.formatValue(rms, 3),
    peakValue: this.formatValue(peakValue, 3)
  };
};

// Analyze vibration data for potential issues
exports.analyzeVibrationData = (data) => {
  const result = {
    status: 'normal',
    warnings: [],
    severity: 0
  };
  
  // Check amplitude thresholds
  if (data.amplitude > 0.8) {
    result.warnings.push('High vibration amplitude detected');
    result.severity += 1;
  }
  
  if (data.amplitude > 1.2) {
    result.warnings.push('Critical vibration amplitude');
    result.severity += 2;
  }
  
  // Check for axis imbalance
  const maxAxis = Math.max(data.axisX, data.axisY, data.axisZ);
  const minAxis = Math.min(data.axisX, data.axisY, data.axisZ);
  
  if (maxAxis / minAxis > 2.5) {
    result.warnings.push('Significant axis imbalance detected');
    result.severity += 1;
  }
  
  // Check for abnormal frequency
  if (data.frequency < 20 || data.frequency > 100) {
    result.warnings.push('Abnormal vibration frequency');
    result.severity += 1;
  }
  
  // Set overall status based on severity
  if (result.severity >= 3) {
    result.status = 'critical';
  } else if (result.severity > 0) {
    result.status = 'warning';
  }
  
  return result;
}; 