# GET Method for Report Generation

## 🎯 **Overview**
The report generation API now supports both **POST** and **GET** methods. The GET method uses query parameters instead of request body, making URLs shareable and easier to test.

## 🔗 **GET Method Examples**

### **1. Excel Report (GET)**
```
GET http://localhost:2507/api/reports/generate?reportType=Asset Inventory&dateRange=thisMonth&format=Excel
Authorization: Bearer YOUR_JWT_TOKEN
```

### **2. CSV Report (GET)**
```
GET http://localhost:2507/api/reports/generate?reportType=Asset Utilization&dateRange=thisWeek&format=CSV
Authorization: Bearer YOUR_JWT_TOKEN
```

### **3. HTML Report (GET)**
```
GET http://localhost:2507/api/reports/generate?reportType=Maintenance History&dateRange=thisQuarter&format=PDF
Authorization: Bearer YOUR_JWT_TOKEN
```

### **4. JSON Report (GET)**
```
GET http://localhost:2507/api/reports/generate?reportType=Asset Location&dateRange=thisYear&format=JSON
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📋 **Query Parameters**

| Parameter | Required | Values | Description |
|-----------|----------|--------|-------------|
| `reportType` | ✅ Yes | `Asset Inventory`, `Asset Utilization`, `Maintenance History`, `Asset Location` | Type of report to generate |
| `dateRange` | ✅ Yes | `today`, `thisWeek`, `thisMonth`, `thisQuarter`, `thisYear` | Date range for the report |
| `format` | ❌ Optional | `PDF`, `Excel`, `CSV`, `JSON` | Output format (defaults to JSON) |

## 🌐 **Frontend Implementation**

### **JavaScript GET Method:**
```javascript
// Function to generate report using GET method
const generateReportGET = async (reportType, dateRange, format) => {
  try {
    // Build query string
    const params = new URLSearchParams({
      reportType,
      dateRange,
      format: format || 'JSON'
    });
    
    const url = `/api/reports/generate?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get filename from headers
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `${reportType.replace(/\s+/g, '_')}_${dateRange}_${Date.now()}.${format.toLowerCase()}`;

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ Report downloaded: ${filename}`);
    
  } catch (error) {
    console.error('Error generating report:', error);
    alert(`❌ Error: ${error.message}`);
  }
};
```

### **HTML Form with GET Method:**
```html
<form id="reportForm" method="GET" action="/api/reports/generate">
  <input type="hidden" name="reportType" id="reportType">
  <input type="hidden" name="dateRange" id="dateRange">
  <input type="hidden" name="format" id="format">
  
  <button type="submit">Generate Report</button>
</form>

<script>
document.getElementById('reportForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Set form values
  document.getElementById('reportType').value = 'Asset Inventory';
  document.getElementById('dateRange').value = 'thisMonth';
  document.getElementById('format').value = 'Excel';
  
  // Submit form
  this.submit();
});
</script>
```

## 🔧 **cURL Examples**

### **Excel Report:**
```bash
curl -X GET "http://localhost:2507/api/reports/generate?reportType=Asset%20Inventory&dateRange=thisMonth&format=Excel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output "asset_inventory_report.xlsx"
```

### **CSV Report:**
```bash
curl -X GET "http://localhost:2507/api/reports/generate?reportType=Asset%20Utilization&dateRange=thisWeek&format=CSV" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output "asset_utilization_report.csv"
```

### **HTML Report:**
```bash
curl -X GET "http://localhost:2507/api/reports/generate?reportType=Maintenance%20History&dateRange=thisQuarter&format=PDF" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output "maintenance_history_report.html"
```

### **JSON Report:**
```bash
curl -X GET "http://localhost:2507/api/reports/generate?reportType=Asset%20Location&dateRange=thisYear&format=JSON" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output "asset_location_report.json"
```

## 📊 **Postman Examples**

### **GET Request Setup:**
1. **Method:** `GET`
2. **URL:** `http://localhost:2507/api/reports/generate`
3. **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`
4. **Query Parameters:**
   - `reportType`: `Asset Inventory`
   - `dateRange`: `thisMonth`
   - `format`: `Excel`

## 🎯 **Benefits of GET Method**

### **✅ Advantages:**
- **Shareable URLs** - Can bookmark and share report links
- **Easier Testing** - Simple to test in browser
- **Cacheable** - Can be cached by browsers/proxies
- **RESTful** - Follows REST principles for data retrieval
- **Simple Integration** - Easy to integrate with forms

### **⚠️ Considerations:**
- **URL Length** - Long URLs with many parameters
- **Security** - Parameters visible in logs/URLs
- **Caching** - May need cache control headers

## 🧪 **Testing**

Run the test script to verify GET method works:

```bash
node test-get-method.js
```

## 🔄 **Both Methods Supported**

The API now supports both methods:

### **POST Method (Original):**
```javascript
POST /api/reports/generate
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "reportType": "Asset Inventory",
  "dateRange": "thisMonth",
  "format": "Excel"
}
```

### **GET Method (New):**
```javascript
GET /api/reports/generate?reportType=Asset%20Inventory&dateRange=thisMonth&format=Excel
Authorization: Bearer YOUR_JWT_TOKEN
```

Both methods work identically and return the same file downloads! 🎉
