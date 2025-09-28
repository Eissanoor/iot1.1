# Complete Postman Examples for All Report Formats

## 📋 **Postman Collection for All Formats**

### 1. **Generate PDF Report - Asset Inventory**

**Method:** `POST`  
**URL:** `http://localhost:2507/api/reports/generate`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "reportType": "Asset Inventory",
  "dateRange": "thisMonth",
  "format": "PDF"
}
```

**Expected Response:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="Asset_Inventory_thisMonth_1234567890.pdf"`
- **Body:** Binary PDF file (downloadable)

---

### 2. **Generate Excel Report - Asset Utilization**

**Method:** `POST`  
**URL:** `http://localhost:2507/api/reports/generate`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "reportType": "Asset Utilization",
  "dateRange": "thisWeek",
  "format": "Excel"
}
```

**Expected Response:**
- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename="Asset_Utilization_thisWeek_1234567890.xlsx"`
- **Body:** Binary Excel file (downloadable)

---

### 3. **Generate CSV Report - Maintenance History**

**Method:** `POST`  
**URL:** `http://localhost:2507/api/reports/generate`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "reportType": "Maintenance History",
  "dateRange": "thisQuarter",
  "format": "CSV"
}
```

**Expected Response:**
- **Content-Type:** `text/csv`
- **Content-Disposition:** `attachment; filename="Maintenance_History_thisQuarter_1234567890.csv"`
- **Body:** CSV text file (downloadable)

---

### 4. **Generate JSON Report - Asset Location**

**Method:** `POST`  
**URL:** `http://localhost:2507/api/reports/generate`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Body (JSON):**
```json
{
  "reportType": "Asset Location",
  "dateRange": "thisYear",
  "format": "JSON"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report generated successfully",
  "reportData": {
    "reportType": "Asset Location",
    "dateRange": "thisYear",
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2025-01-01T00:00:00.000Z"
    },
    "totalAssets": 150,
    "totalLocations": 5,
    "data": [
      {
        "location": "Office Building A",
        "assetCount": 45,
        "assets": [...]
      }
    ],
    "generatedAt": "2024-01-20T15:30:00.000Z",
    "format": "JSON"
  }
}
```

---

## 🔧 **Complete Postman Collection JSON**

```json
{
  "info": {
    "name": "Report Generation API - All Formats",
    "description": "Complete API collection for generating reports in PDF, Excel, CSV, and JSON formats",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "PDF Reports",
      "item": [
        {
          "name": "PDF - Asset Inventory",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Inventory\",\n  \"dateRange\": \"thisMonth\",\n  \"format\": \"PDF\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "PDF - Asset Utilization",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Utilization\",\n  \"dateRange\": \"thisWeek\",\n  \"format\": \"PDF\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "PDF - Maintenance History",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Maintenance History\",\n  \"dateRange\": \"thisQuarter\",\n  \"format\": \"PDF\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "PDF - Asset Location",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Location\",\n  \"dateRange\": \"thisYear\",\n  \"format\": \"PDF\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        }
      ]
    },
    {
      "name": "Excel Reports",
      "item": [
        {
          "name": "Excel - Asset Inventory",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Inventory\",\n  \"dateRange\": \"thisMonth\",\n  \"format\": \"Excel\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "Excel - Asset Utilization",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Utilization\",\n  \"dateRange\": \"thisWeek\",\n  \"format\": \"Excel\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "Excel - Maintenance History",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Maintenance History\",\n  \"dateRange\": \"thisQuarter\",\n  \"format\": \"Excel\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "Excel - Asset Location",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Location\",\n  \"dateRange\": \"thisYear\",\n  \"format\": \"Excel\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        }
      ]
    },
    {
      "name": "CSV Reports",
      "item": [
        {
          "name": "CSV - Asset Inventory",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Inventory\",\n  \"dateRange\": \"thisMonth\",\n  \"format\": \"CSV\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "CSV - Asset Utilization",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Utilization\",\n  \"dateRange\": \"thisWeek\",\n  \"format\": \"CSV\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "CSV - Maintenance History",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Maintenance History\",\n  \"dateRange\": \"thisQuarter\",\n  \"format\": \"CSV\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "CSV - Asset Location",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Location\",\n  \"dateRange\": \"thisYear\",\n  \"format\": \"CSV\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        }
      ]
    },
    {
      "name": "JSON Reports",
      "item": [
        {
          "name": "JSON - Asset Inventory",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Inventory\",\n  \"dateRange\": \"thisMonth\",\n  \"format\": \"JSON\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "JSON - Asset Utilization",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Utilization\",\n  \"dateRange\": \"thisWeek\",\n  \"format\": \"JSON\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "JSON - Maintenance History",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Maintenance History\",\n  \"dateRange\": \"thisQuarter\",\n  \"format\": \"JSON\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        },
        {
          "name": "JSON - Asset Location",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"reportType\": \"Asset Location\",\n  \"dateRange\": \"thisYear\",\n  \"format\": \"JSON\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/reports/generate",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "generate"]
            }
          }
        }
      ]
    },
    {
      "name": "Utility Endpoints",
      "item": [
        {
          "name": "Get Report Types",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/reports/types",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "types"]
            }
          }
        },
        {
          "name": "Get Date Ranges",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/reports/date-ranges",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "date-ranges"]
            }
          }
        },
        {
          "name": "Get Available Formats",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/api/reports/formats",
              "host": ["{{base_url}}"],
              "path": ["api", "reports", "formats"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:2507"
    },
    {
      "key": "jwt_token",
      "value": "YOUR_JWT_TOKEN_HERE"
    }
  ]
}
```

---

## 🎯 **Quick Test Examples**

### Test PDF Generation:
```bash
curl -X POST http://localhost:2507/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"reportType": "Asset Inventory", "dateRange": "thisMonth", "format": "PDF"}' \
  --output "asset_inventory_report.pdf"
```

### Test Excel Generation:
```bash
curl -X POST http://localhost:2507/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"reportType": "Asset Utilization", "dateRange": "thisWeek", "format": "Excel"}' \
  --output "asset_utilization_report.xlsx"
```

### Test CSV Generation:
```bash
curl -X POST http://localhost:2507/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"reportType": "Maintenance History", "dateRange": "thisQuarter", "format": "CSV"}' \
  --output "maintenance_history_report.csv"
```

---

## 📝 **Expected File Outputs**

### PDF Files:
- **Filename format:** `Asset_Inventory_thisMonth_1234567890.pdf`
- **Content:** Professional PDF with tables, headers, and styling
- **Size:** Varies based on data (typically 50KB - 500KB)

### Excel Files:
- **Filename format:** `Asset_Utilization_thisWeek_1234567890.xlsx`
- **Content:** Excel workbook with formatted data and headers
- **Size:** Varies based on data (typically 20KB - 200KB)

### CSV Files:
- **Filename format:** `Maintenance_History_thisQuarter_1234567890.csv`
- **Content:** Comma-separated values with headers
- **Size:** Varies based on data (typically 5KB - 100KB)

### JSON Files:
- **Response:** JSON object with structured data
- **Content:** Complete report data with metadata
- **Size:** Varies based on data (typically 10KB - 500KB)

---

## 🚀 **Setup Instructions**

1. **Install dependencies:**
   ```bash
   npm install exceljs csv-writer puppeteer
   ```

2. **Start your server:**
   ```bash
   npm start
   ```

3. **Import the Postman collection** or create requests manually

4. **Set environment variables:**
   - `base_url`: `http://localhost:2507`
   - `jwt_token`: Your actual JWT token

5. **Test all formats** to ensure they work correctly

The implementation now supports all four formats (PDF, Excel, CSV, JSON) with proper file downloads and professional formatting!
