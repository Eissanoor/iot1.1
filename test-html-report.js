/**
 * Test script to verify HTML report generation works
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:2507';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token

async function testHTMLReport() {
  console.log('🧪 Testing HTML Report Generation...\n');

  try {
    const response = await axios.post(
      `${BASE_URL}/api/reports/generate`,
      {
        reportType: 'Asset Inventory',
        dateRange: 'thisMonth',
        format: 'PDF'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT_TOKEN}`
        },
        responseType: 'arraybuffer'
      }
    );

    console.log('✅ HTML Report Generated Successfully!');
    console.log(`📄 Content-Type: ${response.headers['content-type']}`);
    console.log(`📁 Filename: ${response.headers['content-disposition']}`);
    console.log(`📊 File Size: ${response.data.length} bytes`);
    
    // Save the HTML file for testing
    const fs = require('fs');
    fs.writeFileSync('test-report.html', response.data);
    console.log('💾 HTML file saved as "test-report.html"');
    console.log('🌐 Open this file in your browser to view the report');
    console.log('📄 To convert to PDF: Press Ctrl+P → Save as PDF');

  } catch (error) {
    console.log('❌ Error generating HTML report:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testHTMLReport();
}

module.exports = { testHTMLReport };
