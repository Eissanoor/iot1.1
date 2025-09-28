/**
 * Test script for report generation API
 * Run this script to test all report formats
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:2507';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

// Test data for different report types and formats
const testCases = [
  {
    name: 'PDF - Asset Inventory',
    data: {
      reportType: 'Asset Inventory',
      dateRange: 'thisMonth',
      format: 'PDF'
    }
  },
  {
    name: 'Excel - Asset Utilization',
    data: {
      reportType: 'Asset Utilization',
      dateRange: 'thisWeek',
      format: 'Excel'
    }
  },
  {
    name: 'CSV - Maintenance History',
    data: {
      reportType: 'Maintenance History',
      dateRange: 'thisQuarter',
      format: 'CSV'
    }
  },
  {
    name: 'JSON - Asset Location',
    data: {
      reportType: 'Asset Location',
      dateRange: 'thisYear',
      format: 'JSON'
    }
  }
];

async function testReportGeneration() {
  console.log('🚀 Starting Report Generation Tests...\n');

  for (const testCase of testCases) {
    try {
      console.log(`📋 Testing: ${testCase.name}`);
      
      const response = await axios.post(
        `${BASE_URL}/api/reports/generate`,
        testCase.data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JWT_TOKEN}`
          },
          responseType: testCase.data.format === 'JSON' ? 'json' : 'arraybuffer'
        }
      );

      if (testCase.data.format === 'JSON') {
        console.log(`✅ Success: ${testCase.name}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
      } else {
        console.log(`✅ Success: ${testCase.name}`);
        console.log(`   File size: ${response.data.length} bytes`);
        console.log(`   Content-Type: ${response.headers['content-type']}`);
        console.log(`   Filename: ${response.headers['content-disposition']}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${testCase.name}`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
}

async function testUtilityEndpoints() {
  console.log('🔧 Testing Utility Endpoints...\n');

  const endpoints = [
    { name: 'Get Report Types', url: '/api/reports/types' },
    { name: 'Get Date Ranges', url: '/api/reports/date-ranges' },
    { name: 'Get Formats', url: '/api/reports/formats' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`
        }
      });

      console.log(`✅ ${endpoint.name}:`);
      console.log(`   Data: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
      
    } catch (error) {
      console.log(`❌ Error: ${endpoint.name}`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
    }
    
    console.log('');
  }
}

// Main test function
async function runTests() {
  console.log('='.repeat(50));
  console.log('REPORT GENERATION API TEST SUITE');
  console.log('='.repeat(50));
  console.log('');

  // Check if JWT token is set
  if (JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️  WARNING: Please set your JWT token in the JWT_TOKEN variable');
    console.log('   You can get a token by logging in through your auth endpoint');
    console.log('');
  }

  try {
    await testUtilityEndpoints();
    await testReportGeneration();
    
    console.log('='.repeat(50));
    console.log('✅ All tests completed!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.log('❌ Test suite failed:', error.message);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, testReportGeneration, testUtilityEndpoints };
