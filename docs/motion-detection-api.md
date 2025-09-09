# Motion Detection API Documentation

This API provides endpoints to manage motion detection data for your IoT dashboard UI.

## Base URL
```
http://localhost:2507/api/motion-detection
```

## Endpoints

### 1. Create Motion Detection Record
**POST** `/api/motion-detection`

Creates a new motion detection record when motion is detected.

**Request Body:**
```json
{
  "status": "Motion Detected" // or "No Motion"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Motion detection record created successfully",
  "data": {
    "id": 1,
    "status": "Motion Detected",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Dashboard Data (Recommended for UI)
**GET** `/api/motion-detection/dashboard`

Returns all data needed for your motion detection UI dashboard in a single request.

**Response:**
```json
{
  "success": true,
  "message": "Motion detection dashboard data fetched successfully",
  "data": {
    "motionStatus": {
      "status": "No Motion",
      "lastDetected": "Just now"
    },
    "statistics": {
      "today": 24,
      "thisWeek": 142,
      "thisMonth": 523
    },
    "activityChart": [
      {
        "day": "Mon",
        "count": 18,
        "date": "2024-01-08"
      },
      {
        "day": "Tue",
        "count": 22,
        "date": "2024-01-09"
      }
      // ... more days
    ]
  }
}
```

### 3. Get Latest Motion Status
**GET** `/api/motion-detection/latest`

Returns the current motion status for the status card.

**Response:**
```json
{
  "success": true,
  "message": "Latest motion detection record fetched successfully",
  "data": {
    "id": 1,
    "status": "No Motion",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastDetected": "Just now"
  }
}
```

### 4. Get Motion Detection Statistics
**GET** `/api/motion-detection/stats`

Returns detection counts for today, this week, and this month.

**Response:**
```json
{
  "success": true,
  "message": "Motion detection statistics fetched successfully",
  "data": {
    "today": 24,
    "thisWeek": 142,
    "thisMonth": 523
  }
}
```

### 5. Get Motion Activity Chart Data
**GET** `/api/motion-detection/activity`

Returns data for the motion activity chart.

**Query Parameters:**
- `days` (optional): Number of days to include (default: 7)
- `period` (optional): Time period - "24hours", "7days", "30days" (default: "7days")

**Response:**
```json
{
  "success": true,
  "message": "Motion detection activity data fetched successfully",
  "data": [
    {
      "day": "Mon",
      "count": 18,
      "date": "2024-01-08"
    },
    {
      "day": "Tue", 
      "count": 22,
      "date": "2024-01-09"
    }
    // ... more data points
  ]
}
```

### 6. Get All Motion Detection Records
**GET** `/api/motion-detection`

Returns all motion detection records with optional pagination.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of records per page

**Response:**
```json
{
  "success": true,
  "message": "Motion detection records fetched successfully",
  "data": [
    {
      "id": 1,
      "status": "Motion Detected",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
    // ... more records
  ]
}
```

### 7. Get Motion Detection Record by ID
**GET** `/api/motion-detection/:id`

Returns a specific motion detection record.

### 8. Update Motion Detection Record
**PUT** `/api/motion-detection/:id`

Updates a motion detection record.

### 9. Delete Motion Detection Record
**DELETE** `/api/motion-detection/:id`

Deletes a motion detection record.

## Usage Examples for Your UI

### For Motion Status Card:
```javascript
// Get current motion status
fetch('/api/motion-detection/latest')
  .then(response => response.json())
  .then(data => {
    document.getElementById('motion-status').textContent = data.data.status;
    document.getElementById('last-detected').textContent = data.data.lastDetected;
  });
```

### For Statistics Cards:
```javascript
// Get detection statistics
fetch('/api/motion-detection/stats')
  .then(response => response.json())
  .then(data => {
    document.getElementById('today-count').textContent = data.data.today;
    document.getElementById('week-count').textContent = data.data.thisWeek;
    document.getElementById('month-count').textContent = data.data.thisMonth;
  });
```

### For Activity Chart:
```javascript
// Get activity data for chart
fetch('/api/motion-detection/activity?period=7days')
  .then(response => response.json())
  .then(data => {
    // Use data.data array to populate your chart
    const chartData = data.data.map(item => ({
      x: item.day,
      y: item.count
    }));
    // Initialize your chart with chartData
  });
```

### Complete Dashboard (Recommended):
```javascript
// Get all dashboard data in one request
fetch('/api/motion-detection/dashboard')
  .then(response => response.json())
  .then(data => {
    const { motionStatus, statistics, activityChart } = data.data;
    
    // Update motion status
    document.getElementById('motion-status').textContent = motionStatus.status;
    document.getElementById('last-detected').textContent = motionStatus.lastDetected;
    
    // Update statistics
    document.getElementById('today-count').textContent = statistics.today;
    document.getElementById('week-count').textContent = statistics.thisWeek;
    document.getElementById('month-count').textContent = statistics.thisMonth;
    
    // Update chart
    updateMotionChart(activityChart);
  });
```

## Arduino/IoT Device Integration

To send motion detection data from your Arduino or IoT device:

```javascript
// When motion is detected
fetch('/api/motion-detection', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'Motion Detected'
  })
});

// When no motion is detected
fetch('/api/motion-detection', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'No Motion'
  })
});
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (missing required fields)
- `404`: Record not found
- `500`: Internal server error
