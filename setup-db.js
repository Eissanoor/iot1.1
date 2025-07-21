const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Setting up SQL Server database with Prisma...');

try {
  // Check if .env file exists
  if (!fs.existsSync('.env')) {
    console.log('Creating .env file...');
    fs.writeFileSync('.env', `# SQL Server connection string
# Format: sqlserver://[username]:[password]@[host]:[port];database=[database];trustServerCertificate=true
DATABASE_URL="sqlserver://localhost:1433;database=iot-sensor-data;user=sa;password=YourStrongPassword;trustServerCertificate=true"

# Server configuration
PORT=3000
`);
    console.log('.env file created. Please update the DATABASE_URL with your SQL Server credentials.');
    console.log('\nExample formats for DATABASE_URL:');
    console.log('1. Windows Authentication: DATABASE_URL="sqlserver://localhost:1433;database=iot-sensor-data;integratedSecurity=true;trustServerCertificate=true"');
    console.log('2. SQL Authentication: DATABASE_URL="sqlserver://localhost:1433;database=iot-sensor-data;user=sa;password=YourPassword;trustServerCertificate=true"');
    console.log('3. Azure SQL: DATABASE_URL="sqlserver://yourserver.database.windows.net:1433;database=iot-sensor-data;user=username;password=password;encrypt=true;trustServerCertificate=false"');
  } else {
    console.log('.env file already exists. Make sure it contains the DATABASE_URL for SQL Server.');
  }

  // Make sure the prisma directory exists
  if (!fs.existsSync('prisma')) {
    fs.mkdirSync('prisma');
    console.log('Created prisma directory.');
  }

  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Create database and run migrations
  console.log('Running database migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  
  console.log('Database setup completed successfully!');
  console.log('You can now start the server with: npm start');
} catch (error) {
  console.error('Error setting up database:', error.message);
  process.exit(1);
} 