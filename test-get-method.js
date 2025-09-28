/**
 * Test script to verify GET method works for report generation
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:2507';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

async function testGetMethod() {
  console.log('🧪 Testing GET Method for Report Generation...\n');

  // Test cases for GET method
  const testCases = [
    {
      name: 'GET - Excel Report',
      url: `${BASE_URL}/api/reports/generate?reportType=Asset Inventory&dateRange=thisMonth&format=Excel`,
      expectedFile: 'Asset_Inventory_thisMonth_*.xlsx'
    },
    {
      name: 'GET - CSV Report', 
      url: `${BASE_URL}/api/reports/generate?reportType=Asset Utilization&dateRange=thisWeek&format=CSV`,
      expectedFile: 'Asset_Utilization_thisWeek_*.csv'
    },
    {
      name: 'GET - HTML Report (PDF format)',
      url: `${BASE_URL}/api/reports/generate?reportType=Maintenance History&dateRange=thisQuarter&format=PDF`,
      expectedFile: 'Maintenance_History_thisQuarter_*.html'
    },
    {
      name: 'GET - JSON Report',
      url: `${BASE_URL}/api/reports/generate?reportType=Asset Location&dateRange=thisYear&format=JSON`,
      expectedFile: 'Asset_Location_thisYear_*.json'
    }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n📋 Testing: ${testCase.name}`);
      console.log(`🔗 URL: ${testCase.url}`);
      
      const response = await axios.get(testCase.url, {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`
        },
        responseType: 'arraybuffer'
      });

      console.log(`✅ ${testCase.name} - Download Triggered Successfully!`);
      console.log(`📄 Content-Type: ${response.headers['content-type']}`);
      console.log(`📁 Content-Disposition: ${response.headers['content-disposition']}`);
      console.log(`📊 Content-Length: ${response.headers['content-length']}`);
      console.log(`📦 Data Length: ${response.data.length} bytes`);

      // Save the file
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `test_${Date.now()}.file`;
      
      fs.writeFileSync(filename, response.data);
      console.log(`💾 File saved as: ${filename}`);
      
      // Verify file has content
      if (response.data.length > 0) {
        console.log(`✅ File contains data (${response.data.length} bytes)`);
      } else {
        console.log(`❌ File is empty!`);
      }

    } catch (error) {
      console.log(`❌ Error testing ${testCase.name}:`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
      
      if (error.response?.status === 401) {
        console.log('🔐 Authentication Error: Please set a valid JWT token');
      }
    }
    
    console.log('-'.repeat(50));
  }
  
  console.log('\n🎯 GET Method Test Summary:');
  console.log('✅ GET method should work for all report types');
  console.log('🔗 URLs are now shareable and bookmarkable');
  console.log('📁 Files should download automatically');
  console.log('\n📝 Note: If JWT token is not set, you\'ll get authentication errors');
}

// Run test
testGetMethod();
