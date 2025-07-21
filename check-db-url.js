require('dotenv').config();
const { execSync } = require('child_process');

console.log('SQL Server Connection String Checker');
console.log('===================================');

// Get the DATABASE_URL from environment
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL not found in .env file!');
  console.log('Please create a .env file with a DATABASE_URL entry.');
  process.exit(1);
}

console.log('Found DATABASE_URL in environment variables.');

// Basic format check
if (!dbUrl.startsWith('sqlserver://')) {
  console.error('❌ DATABASE_URL does not start with "sqlserver://" which is required for SQL Server connections.');
  console.log('Please check your connection string format.');
  process.exit(1);
}

// Check for required components
const requiredComponents = ['database='];
const missingComponents = [];

requiredComponents.forEach(component => {
  if (!dbUrl.includes(component)) {
    missingComponents.push(component);
  }
});

if (missingComponents.length > 0) {
  console.error(`❌ DATABASE_URL is missing required components: ${missingComponents.join(', ')}`);
  console.log('Please check your connection string format.');
  process.exit(1);
}

// Check authentication method
const hasIntegratedSecurity = dbUrl.includes('integratedSecurity=true');
const hasSqlAuth = dbUrl.includes('user=') && dbUrl.includes('password=');

if (!hasIntegratedSecurity && !hasSqlAuth) {
  console.error('❌ DATABASE_URL does not specify an authentication method.');
  console.log('You must use either:');
  console.log('- Windows Authentication: integratedSecurity=true');
  console.log('- SQL Authentication: user=username;password=password');
  process.exit(1);
}

console.log('✅ DATABASE_URL format appears valid.');
console.log('Authentication method:', hasIntegratedSecurity ? 'Windows Authentication' : 'SQL Authentication');

// Check if trustServerCertificate is set
if (!dbUrl.includes('trustServerCertificate=')) {
  console.log('⚠️ Warning: trustServerCertificate is not specified. This might cause connection issues.');
  console.log('Consider adding trustServerCertificate=true for development environments.');
}

console.log('\nAttempting to connect to the database...');

try {
  // Try to run a simple Prisma command to check connection
  execSync('npx prisma db pull', { stdio: 'inherit' });
  console.log('✅ Successfully connected to the database!');
} catch (error) {
  console.error('❌ Failed to connect to the database.');
  console.error('Please check your connection string and ensure SQL Server is running.');
  console.error('You may need to create the database if it does not exist.');
  process.exit(1);
}

console.log('\nConnection check completed successfully!'); 