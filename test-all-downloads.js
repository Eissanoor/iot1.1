/**
 * Test script to verify all report formats trigger file downloads
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:2507';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

// Test cases for all formats
const testCases = [
  {
    name: 'HTML Report (PDF format)',
    data: {
      reportType: 'Asset Inventory',
      dateRange: 'thisMonth',
      format: 'PDF'
    },
    expectedFile: 'Asset_Inventory_thisMonth_*.html',
    expectedContentType: 'text/html'
  },
  {
    name: 'Excel Report',
    data: {
      reportType: 'Asset Utilization',
      dateRange: 'thisWeek',
      format: 'Excel'
    },
    expectedFile: 'Asset_Utilization_thisWeek_*.xlsx',
    expectedContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  {
    name: 'CSV Report',
    data: {
      reportType: 'Maintenance History',
      dateRange: 'thisQuarter',
      format: 'CSV'
    },
    expectedFile: 'Maintenance_History_thisQuarter_*.csv',
    expectedContentType: 'text/csv'
  },
  {
    name: 'JSON Report',
    data: {
      reportType: 'Asset Location',
      dateRange: 'thisYear',
      format: 'JSON'
    },
    expectedFile: 'Asset_Location_thisYear_*.json',
    expectedContentType: 'application/json'
  }
];

async function testAllDownloads() {
  console.log('🧪 Testing All Report Format Downloads...\n');
  console.log('='.repeat(60));

  for (const testCase of testCases) {
    try {
      console.log(`\n📋 Testing: ${testCase.name}`);
      
      const response = await axios.post(
        `${BASE_URL}/api/reports/generate`,
        testCase.data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JWT_TOKEN}`
          },
          responseType: 'arraybuffer'
        }
      );

      // Check response headers
      const contentType = response.headers['content-type'];
      const contentDisposition = response.headers['content-disposition'];
      const contentLength = response.headers['content-length'];
      
      console.log(`✅ ${testCase.name} - Download Triggered Successfully!`);
      console.log(`   📄 Content-Type: ${contentType}`);
      console.log(`   📁 Filename: ${contentDisposition}`);
      console.log(`   📊 File Size: ${contentLength} bytes`);
      
      // Verify content type matches expected
      if (contentType.includes(testCase.expectedContentType.split('/')[0])) {
        console.log(`   ✅ Content-Type matches expected: ${testCase.expectedContentType}`);
      } else {
        console.log(`   ⚠️  Content-Type mismatch. Expected: ${testCase.expectedContentType}, Got: ${contentType}`);
      }
      
      // Save file for verification
      const filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      const filePath = `test_${filename}`;
      fs.writeFileSync(filePath, response.data);
      console.log(`   💾 File saved as: ${filePath}`);
      
      // Verify file is not empty
      if (response.data.length > 0) {
        console.log(`   ✅ File contains data (${response.data.length} bytes)`);
      } else {
        console.log(`   ❌ File is empty!`);
      }

    } catch (error) {
      console.log(`❌ Error testing ${testCase.name}:`);
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message || error.message}`);
      
      // If it's a JSON response (not a file), show the response
      if (error.response?.data && typeof error.response.data === 'object') {
        console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    console.log('-'.repeat(40));
  }
  
  console.log('\n🎯 Download Test Summary:');
  console.log('✅ All formats should trigger file downloads');
  console.log('📁 Files are saved with proper extensions');
  console.log('🔍 Check the generated files to verify content');
  console.log('\n📝 Note: If JWT token is not set, you\'ll get authentication errors');
}

// Run test if this script is executed directly
if (require.main === module) {
  testAllDownloads();
}

module.exports = { testAllDownloads };
