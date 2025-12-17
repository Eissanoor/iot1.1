# IoT Sensor Data Server

A Node.js server for collecting, storing, and retrieving IoT sensor data for temperature, humidity, and soil moisture sensors.

## Features

- REST API for temperature, humidity, and soil moisture data
- User authentication with JWT
- Automatic data generation for testing/development
- Automatic cleanup of old data
- SQL Server database with Prisma ORM

## Prerequisites

- Node.js 14+ and npm
- SQL Server (local or remote)

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure your SQL Server connection:
   Edit the `.env` file and update the `DATABASE_URL` with your SQL Server credentials.
   
   **SQL Server Connection String Formats:**
   
   - Windows Authentication:
     ```
     DATABASE_URL="sqlserver://localhost:1433;database=iot-sensor-data;integratedSecurity=true;trustServerCertificate=true"
     ```
   
   - SQL Authentication:
     ```
     DATABASE_URL="sqlserver://localhost:1433;database=iot-sensor-data;user=sa;password=YourPassword;trustServerCertificate=true"
     ```
   
   - Azure SQL:
     ```
     DATABASE_URL="sqlserver://yourserver.database.windows.net:1433;database=iot-sensor-data;user=username;password=password;encrypt=true;trustServerCertificate=false"
     ```

4. Check your database connection:
   ```
   npm run check-db-url
   ```

5. Run the setup script to initialize the database:
   ```
   npm run setup
   ```
   This will:
   - Generate the Prisma client
   - Create the database tables
   - Set up the initial schema

6. (Optional) Seed the database with test data:
   ```
   npm run seed-db
   ```

## Weekly Database Backups (Google Drive)

- The server now creates a weekly `.bak` file and uploads it to Google Drive using a service account.
- **For detailed setup instructions, see [docs/google-drive-setup.md](docs/google-drive-setup.md)**
- Environment variables to add to your `.env`:
  ```
  # Database backup scheduling
  DB_BACKUP_ENABLED=true
  DB_BACKUP_CRON=0 3 * * 1   # Every Monday at 03:00 UTC
  DB_BACKUP_TZ=UTC

  # Google Drive service account (share the target folder with this account)
  GOOGLE_DRIVE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
  GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  GOOGLE_DRIVE_BACKUP_FOLDER_ID=your_drive_folder_id   # optional; uploads to root if omitted
  ```
- The backup file is first written to the local `backups/` folder, then uploaded. Ensure the SQL Server service account has write access to that folder.
- Adjust `DB_BACKUP_CRON` if you need a different schedule (cron syntax). Set `DB_BACKUP_ENABLED=false` to disable scheduling.

## Running the Server

Start the server:
```
npm start
```

For development with auto-reload:
```
npm run dev
```

The server will run on http://localhost:3000 by default.

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server with auto-reload (nodemon)
- `npm run setup` - Initialize the database and generate Prisma client
- `npm run check-db-url` - Check if your DATABASE_URL is valid
- `npm run test-db` - Test the database connection
- `npm run seed-db` - Seed the database with test data
- `npm run migrate-data` - Migrate data from MongoDB to SQL Server

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create a new user account
  ```json
  {
    "email": "user@example.com",
    "username": "username",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login with email and password
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user info (requires authentication)
  ```
  Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  ```

### Temperature and Humidity

- `GET /api/temperature` - Get all temperature/humidity records (with pagination)
- `GET /api/temperature/latest` - Get latest temperature/humidity reading
- `POST /api/temperature` - Submit new temperature/humidity data

### Soil Moisture

- `GET /api/soil-moisture` - Get all soil moisture records (with pagination)
- `GET /api/soil-moisture/latest` - Get latest soil moisture reading
- `POST /api/soil-moisture` - Submit new soil moisture data

### Admin

- `POST /api/admin/cleanup` - Manually trigger data cleanup
- `POST /api/admin/cleanup/force` - Force aggressive cleanup
- `GET /api/admin/collections/size` - Get collection sizes
- `GET /api/admin/cleanup/config` - Get cleanup configuration
- `PUT /api/admin/cleanup/config` - Update cleanup configuration

## Data Simulation

The server automatically generates simulated sensor data:
- Temperature/humidity data every 3 seconds
- Soil moisture data every 5 seconds
- Weather scenarios change randomly to simulate real-world conditions 