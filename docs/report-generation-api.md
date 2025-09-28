# Report Generation API Documentation

## Overview
This document describes the report generation feature that allows users to generate various types of reports with different date ranges and output formats.

## Features
- **Report Types**: Asset Inventory, Asset Utilization, Maintenance History, Asset Location
- **Date Ranges**: Today, This Week, This Month, This Quarter, This Year
- **Output Formats**: JSON, PDF, Excel, CSV (PDF, Excel, CSV require additional implementation)

## API Endpoints

### 1. Generate Report
**POST** `/api/reports/generate`

Generates a report based on the specified parameters.

#### Request Body
```json
{
  "reportType": "Asset Inventory",
  "dateRange": "thisMonth",
  "format": "JSON"
}
```

#### Parameters
- `reportType` (required): One of the following:
  - `"Asset Inventory"` - Complete list of all assets with their details
  - `"Asset Utilization"` - Asset usage statistics and utilization rates
  - `"Maintenance History"` - Assets under maintenance and maintenance history
  - `"Asset Location"` - Assets grouped by their locations

- `dateRange` (required): One of the following:
  - `"today"` - Data from today only
  - `"thisWeek"` - Data from the current week
  - `"thisMonth"` - Data from the current month
  - `"thisQuarter"` - Data from the current quarter
  - `"thisYear"` - Data from the current year

- `format` (optional): Output format
  - `"JSON"` - JSON format for API consumption (default)
  - `"PDF"` - PDF document format (requires additional implementation)
  - `"Excel"` - Excel spreadsheet format (requires additional implementation)
  - `"CSV"` - Comma-separated values format (requires additional implementation)

#### Response
```json
{
  "success": true,
  "message": "Report generated successfully",
  "reportData": {
    "reportType": "Asset Inventory",
    "dateRange": "thisMonth",
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-02-01T00:00:00.000Z"
    },
    "totalAssets": 25,
    "data": [
      {
        "id": 1,
        "assetName": "Laptop Computer",
        "assetTag": "LAP001",
        "category": "Electronics",
        "brand": "Dell",
        "location": "Office Building A",
        "department": "IT Department",
        "assetStatus": "In Use",
        "assetCondition": "Good",
        "purchaseDate": "2024-01-15T00:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "generatedAt": "2024-01-20T15:30:00.000Z",
    "format": "JSON"
  }
}
```

### 2. Get Report Types
**GET** `/api/reports/types`

Returns available report types.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "value": "Asset Inventory",
      "label": "Asset Inventory",
      "description": "Complete list of all assets with their details"
    },
    {
      "value": "Asset Utilization",
      "label": "Asset Utilization",
      "description": "Asset usage statistics and utilization rates"
    }
  ]
}
```

### 3. Get Date Ranges
**GET** `/api/reports/date-ranges`

Returns available date ranges.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "value": "today",
      "label": "Today",
      "description": "Data from today only"
    },
    {
      "value": "thisWeek",
      "label": "This Week",
      "description": "Data from the current week"
    }
  ]
}
```

### 4. Get Formats
**GET** `/api/reports/formats`

Returns available output formats.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "value": "JSON",
      "label": "JSON",
      "description": "JSON format for API consumption"
    },
    {
      "value": "PDF",
      "label": "PDF",
      "description": "PDF document format"
    }
  ]
}
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Handling
The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request` - Invalid parameters or validation errors
- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Server-side errors

## Example Usage

### Frontend Integration
```javascript
// Generate Asset Inventory Report for this month
const generateReport = async () => {
  try {
    const response = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        reportType: 'Asset Inventory',
        dateRange: 'thisMonth',
        format: 'JSON'
      })
    });
    
    const result = await response.json();
    console.log('Report generated:', result);
  } catch (error) {
    console.error('Error generating report:', error);
  }
};
```

### cURL Example
```bash
curl -X POST http://localhost:2507/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "reportType": "Asset Inventory",
    "dateRange": "thisMonth",
    "format": "JSON"
  }'
```

## Implementation Notes

### Current Implementation
- ✅ JSON format is fully implemented
- ✅ All report types are functional
- ✅ Date range filtering works correctly
- ✅ Authentication and validation are in place

### Future Enhancements
To implement PDF, Excel, and CSV formats, you'll need to:

1. **For PDF Generation**:
   - Install `puppeteer` or `pdfkit`
   - Create HTML templates for reports
   - Generate PDF files and serve them

2. **For Excel Generation**:
   - Install `exceljs`
   - Create Excel workbooks with formatted data
   - Generate and serve Excel files

3. **For CSV Generation**:
   - Use simple string manipulation or `csv-writer`
   - Convert data to CSV format
   - Serve as downloadable files

## File Structure
```
controllers/
  └── reportController.js    # Report generation logic
routes/
  └── reportRoutes.js        # API routes and validation
docs/
  └── report-generation-api.md # This documentation
```

## Testing
You can test the API using:
1. Postman or similar API testing tools
2. Frontend integration
3. cURL commands
4. Unit tests (recommended)

## Security Considerations
- All endpoints require authentication
- Input validation prevents malicious data
- SQL injection protection through Prisma ORM
- Rate limiting recommended for production use
