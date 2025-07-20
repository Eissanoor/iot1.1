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
  │   ├── sensorData.js
  │   ├── soilMoistureData.js
  │   └── ... (other sensor models)
  ├── routes/
  │   ├── temperatureHumidityRoutes.js
  │   ├── soilMoistureRoutes.js
  │   └── ... (other sensor routes)
  ├── utils/
  │   └── sensorUtils.js
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

## API Endpoints

### Temperature and Humidity

- `POST /api/sensor-data` - Submit new temperature and humidity readings
- `GET /api/sensor-data` - Get all temperature and humidity readings (with pagination)
- `GET /api/sensor-data/latest` - Get the latest temperature and humidity reading

### Soil Moisture

- `POST /api/soil-moisture` - Submit new soil moisture reading
- `GET /api/soil-moisture` - Get all soil moisture readings (with pagination)
- `GET /api/soil-moisture/latest` - Get the latest soil moisture reading

## Adding New Sensor Types

To add a new sensor type to the system, follow these steps:

1. Create a new model file in the `models/` directory
2. Create a new controller file in the `controllers/` directory
3. Create a new routes file in the `routes/` directory
4. Update `server.js` to:
   - Import the new controller and routes
   - Set up any necessary cron jobs
   - Register the new routes

### Example: Adding Light Sensor

1. Create `models/lightData.js`
2. Create `controllers/lightController.js`
3. Create `routes/lightRoutes.js`
4. Update `server.js` to include the new sensor type

## Running the Server

```
npm install
node server.js
```

The server will run on port 3000 by default. 