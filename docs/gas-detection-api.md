# Gas Detection API Documentation

## Overview
The Gas Detection API provides endpoints for monitoring gas levels with automatic safety classification based on predefined thresholds.

### Safety Thresholds
- **Safe**: ≤ 100 ppm (Green)
- **Warning**: 101-300 ppm (Yellow) 
- **Danger**: > 300 ppm (Red)

## Base URL
```
/api/gas-detection
```

## Endpoints

### 1. Create Gas Detection Record
**POST** `/api/gas-detection`

Creates a new gas detection record with automatic safety level classification.

**Request Body:**
```json
{
  "status": 93.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Gas detection record created successfully",
  "data": {
    "id": 1,
    "status": 93.5,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "safetyLevel": {
      "level": "Safe",
      "color": "green",
      "message": "Gas levels are within safe limits"
    }
  }
}
```

### 2. Get Current Gas Level
**GET** `/api/gas-detection/current`

Returns the most recent gas detection reading with safety information.

**Response:**
```json
{
  "success": true,
  "message": "Current gas level retrieved successfully",
  "data": {
    "id": 1,
    "status": 93,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "safetyLevel": {
      "level": "Safe",
      "color": "green",
      "message": "Gas levels are within safe limits"
    },
    "gasType": "Methane (CH4)",
    "unit": "ppm"
  }
}
```

### 3. Get Gas Level History
**GET** `/api/gas-detection/history`

Returns historical gas level data with filtering options.

**Query Parameters:**
- `timeRange`: `1hour`, `24hours`, `7days`, `30days` (default: `24hours`)
- `startDate`: Custom start date (ISO format)
- `endDate`: Custom end date (ISO format)
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 100)

**Response:**
```json
{
  "success": true,
  "message": "Gas level history retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": 93,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z",
      "safetyLevel": {
        "level": "Safe",
        "color": "green",
        "message": "Gas levels are within safe limits"
      },
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ],
  "statistics": {
    "average": "95.50",
    "minimum": 85,
    "maximum": 120,
    "totalReadings": 24
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalRecords": 24
  }
}
```

### 4. Get Safety Status Summary
**GET** `/api/gas-detection/safety-summary`

Returns safety statistics and current status overview.

**Query Parameters:**
- `timeRange`: `1hour`, `24hours`, `7days`, `30days` (default: `24hours`)

**Response:**
```json
{
  "success": true,
  "message": "Safety status summary retrieved successfully",
  "data": {
    "currentLevel": {
      "id": 1,
      "status": 93,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z",
      "safetyLevel": {
        "level": "Safe",
        "color": "green",
        "message": "Gas levels are within safe limits"
      }
    },
    "summary": {
      "timeRange": "24hours",
      "totalReadings": 100,
      "safeReadings": 85,
      "warningReadings": 12,
      "dangerReadings": 3,
      "safePercentage": "85.0",
      "warningPercentage": "12.0",
      "dangerPercentage": "3.0"
    },
    "thresholds": {
      "safe": { "min": 0, "max": 100, "unit": "ppm" },
      "warning": { "min": 101, "max": 300, "unit": "ppm" },
      "danger": { "min": 301, "max": null, "unit": "ppm" }
    }
  }
}
```

### 5. Get All Gas Detection Records
**GET** `/api/gas-detection`

Returns paginated list of all gas detection records.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10)
- `sortBy`: Sort field (default: `createdAt`)
- `sortOrder`: `asc` or `desc` (default: `desc`)

### 6. Get Gas Detection Record by ID
**GET** `/api/gas-detection/:id`

Returns a specific gas detection record by ID.

### 7. Update Gas Detection Record
**PUT** `/api/gas-detection/:id`

Updates an existing gas detection record.

**Request Body:**
```json
{
  "status": 150.5
}
```

### 8. Delete Gas Detection Record
**DELETE** `/api/gas-detection/:id`

Deletes a gas detection record by ID.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Example Usage

### Arduino/IoT Device Integration
```javascript
// Send gas sensor data
const gasLevel = 93.5; // ppm value from sensor

fetch('/api/gas-detection', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: gasLevel
  })
})
.then(response => response.json())
.then(data => {
  console.log('Safety Level:', data.data.safetyLevel.level);
  console.log('Message:', data.data.safetyLevel.message);
});
```

### Dashboard Integration
```javascript
// Get current gas level for dashboard
fetch('/api/gas-detection/current')
.then(response => response.json())
.then(data => {
  const { status, safetyLevel } = data.data;
  updateDashboard(status, safetyLevel);
});

// Get historical data for charts
fetch('/api/gas-detection/history?timeRange=24hours')
.then(response => response.json())
.then(data => {
  renderChart(data.data);
});
```
