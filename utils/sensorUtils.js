/**
 * Utility functions for sensor data operations
 */

// Format a number to specified decimal places
exports.formatValue = (value, decimalPlaces = 2) => {
  return parseFloat(value.toFixed(decimalPlaces));
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