/**
 * Simple test to verify file downloads work
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:2507';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

async function testDownload() {
  console.log('🧪 Testing File Download...\n');

  try {
    // Test Excel download
    console.log('📊 Testing Excel download...');
    const response = await axios.post(
      `${BASE_URL}/api/reports/generate`,
      {
        reportType: 'Asset Inventory',
        dateRange: 'thisMonth',
        format: 'Excel'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT_TOKEN}`
        },
        responseType: 'arraybuffer'
      }
    );

    console.log('✅ Response received!');
    console.log(`📄 Content-Type: ${response.headers['content-type']}`);
    console.log(`📁 Content-Disposition: ${response.headers['content-disposition']}`);
    console.log(`📊 Content-Length: ${response.headers['content-length']}`);
    console.log(`📦 Data Length: ${response.data.length} bytes`);

    // Save the file
    const filename = 'test_report.xlsx';
    fs.writeFileSync(filename, response.data);
    console.log(`💾 File saved as: ${filename}`);
    
    // Verify file exists and has content
    if (fs.existsSync(filename)) {
      const stats = fs.statSync(filename);
      console.log(`✅ File exists with size: ${stats.size} bytes`);
      
      if (stats.size > 0) {
        console.log('🎉 SUCCESS: File download is working correctly!');
        console.log('📁 You can open the Excel file to verify the content');
      } else {
        console.log('❌ File is empty - there might be an issue');
      }
    } else {
      console.log('❌ File was not created');
    }

  } catch (error) {
    console.log('❌ Error during download test:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.status === 401) {
      console.log('🔐 Authentication Error: Please set a valid JWT token');
    }
  }
}

// Run test
testDownload();
