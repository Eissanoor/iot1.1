# Arduino Sensor Data Backend

This is a Node.js backend server for collecting and serving sensor data from Arduino devices.

## Project Structure

```
backend/
  ├── controllers/
  │   ├── temperatureHumidityController.js
  │   ├── soilMoistureController.js
  │   └── ... (other sensor controllers)
  ├── models/
  │   ├── temperatureData.js
  │   ├── soilMoistureData.js
  │   └── ... (other sensor models)
  ├── routes/
  │   ├── temperatureHumidityRoutes.js
  │   ├── soilMoistureRoutes.js
  │   ├── adminRoutes.js
  │   └── ... (other sensor routes)
  ├── services/
  │   └── cleanupService.js
  ├── utils/
  │   ├── sensorUtils.js
  │   └── cleanupUtils.js
  ├── server.js
  ├── package.json
  └── package-lock.json
```

## Features

- Collects and stores temperature and humidity data
- Collects and stores soil moisture data
- Simulates realistic sensor data patterns
- RESTful API for accessing sensor data
- Pagination support for data retrieval
- Automatic cleanup of old data when collections exceed size limits

## API Endpoints

### Temperature and Humidity

- `POST /api/temperature` - Submit new temperature and humidity readings
- `GET /api/temperature` - Get all temperature and humidity readings (with pagination)
- `GET /api/temperature/latest` - Get the latest temperature and humidity reading

### Soil Moisture

- `POST /api/soil-moisture` - Submit new soil moisture reading
- `GET /api/soil-moisture` - Get all soil moisture readings (with pagination)
- `GET /api/soil-moisture/latest` - Get the latest soil moisture reading

### Admin Routes

- `POST /api/admin/cleanup` - Manually trigger regular cleanup of old data
- `POST /api/admin/cleanup/force` - Force aggressive cleanup for large collections
- `GET /api/admin/collections/size` - Get current size of all collections
- `GET /api/admin/cleanup/config` - Get current cleanup configuration
- `PUT /api/admin/cleanup/config` - Update cleanup configuration

## Data Cleanup

The system automatically cleans up old data when collections exceed a certain size:

- Default threshold: 80 records
- Default cleanup amount: 30 oldest records
- Regular cleanup runs every minute via cron job
- Aggressive cleanup check runs every 5 minutes for large collections
- Initial cleanup runs when server starts
- For collections with 150+ records, the system will aggressively clean up to bring the size down to the configured limit
- Configuration can be adjusted via admin API

## Adding New Sensor Types

To add a new sensor type to the system, follow these steps:

1. Create a new model file in the `models/` directory
2. Create a new controller file in the `controllers/` directory
3. Create a new routes file in the `routes/` directory
4. Update `server.js` to:
   - Import the new controller and routes
   - Set up any necessary cron jobs
   - Register the new routes
5. Update `services/cleanupService.js` to include the new collection in cleanup

### Example: Adding Light Sensor

1. Create `models/lightData.js`
2. Create `controllers/lightController.js`
3. Create `routes/lightRoutes.js`
4. Update `server.js` to include the new sensor type
5. Add the light sensor to the cleanup configuration

## Running the Server

```
npm install
node server.js
```

The server will run on port 3000 by default. 