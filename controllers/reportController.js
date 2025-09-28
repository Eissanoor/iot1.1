const prisma = require('../prisma/client');
const { validationResult } = require('express-validator');
const ExcelJS = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');


/**
 * Helper function to calculate date range based on the selected option
 */
const getDateRange = (dateRange) => {
  const now = new Date();
  let startDate, endDate;

  switch (dateRange) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case 'thisWeek':
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case 'thisQuarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
      break;
    case 'thisYear':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
      break;
    default:
      // Default to this month if invalid range
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  return { startDate, endDate };
};

/**
 * Generate PDF report using HTML (simplified approach)
 * This creates an HTML file that can be printed to PDF by the browser
 */
const generatePDFReport = async (reportData) => {
  // Create HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${reportData.reportType} Report</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.4;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .header h1 { 
          color: #333; 
          margin-bottom: 10px; 
          font-size: 24px;
        }
        .header p { 
          color: #666; 
          margin: 5px 0;
        }
        .summary { 
          background: #f5f5f5; 
          padding: 15px; 
          margin-bottom: 20px; 
          border-radius: 5px; 
          border-left: 4px solid #007bff;
        }
        .summary h3 { 
          margin-top: 0; 
          color: #333; 
          font-size: 18px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px; 
          font-size: 12px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold; 
          color: #333;
        }
        tr:nth-child(even) { 
          background-color: #f9f9f9; 
        }
        .footer { 
          margin-top: 30px; 
          text-align: center; 
          color: #666; 
          font-size: 12px; 
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .print-instructions {
          background: #e7f3ff;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="print-instructions no-print">
        <strong>📄 PDF Generation:</strong> This is a formatted HTML report. To save as PDF: 
        <br>1. Press Ctrl+P (Print)
        <br>2. Select "Save as PDF" as destination
        <br>3. Click "Save"
      </div>
      
      <div class="header">
        <h1>${reportData.reportType} Report</h1>
        <p>Generated on: ${new Date(reportData.generatedAt).toLocaleString()}</p>
        <p>Date Range: ${reportData.dateRange} (${new Date(reportData.period.startDate).toLocaleDateString()} - ${new Date(reportData.period.endDate).toLocaleDateString()})</p>
      </div>
      
      <div class="summary">
        <h3>Summary</h3>
        ${reportData.totalAssets ? `<p><strong>Total Assets:</strong> ${reportData.totalAssets}</p>` : ''}
        ${reportData.summary ? Object.entries(reportData.summary).map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`).join('') : ''}
      </div>
      
      <table>
        <thead>
          <tr>
            ${Object.keys(reportData.data[0] || {}).map(key => `<th>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${reportData.data.map(row => `
            <tr>
              ${Object.values(row).map(value => `<td>${value || 'N/A'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Report generated by IoT Asset Management System</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
  
  return Buffer.from(htmlContent, 'utf8');
};

/**
 * Generate Excel report using ExcelJS
 */
const generateExcelReport = async (reportData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(reportData.reportType);
  
  // Add header information
  worksheet.addRow([`${reportData.reportType} Report`]);
  worksheet.addRow([`Generated on: ${new Date(reportData.generatedAt).toLocaleString()}`]);
  worksheet.addRow([`Date Range: ${reportData.dateRange}`]);
  worksheet.addRow([`Period: ${new Date(reportData.period.startDate).toLocaleDateString()} - ${new Date(reportData.period.endDate).toLocaleDateString()}`]);
  worksheet.addRow([]); // Empty row
  
  // Add summary if available
  if (reportData.summary) {
    worksheet.addRow(['Summary:']);
    Object.entries(reportData.summary).forEach(([key, value]) => {
      worksheet.addRow([key, value]);
    });
    worksheet.addRow([]); // Empty row
  }
  
  // Add data headers
  if (reportData.data.length > 0) {
    const headers = Object.keys(reportData.data[0]);
    worksheet.addRow(headers);
    
    // Style headers
    const headerRow = worksheet.getRow(worksheet.rowCount);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add data rows
    reportData.data.forEach(row => {
      const values = Object.values(row);
      worksheet.addRow(values);
    });
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

/**
 * Generate CSV report
 */
const generateCSVReport = async (reportData) => {
  if (reportData.data.length === 0) {
    return Buffer.from('No data available');
  }
  
  const headers = Object.keys(reportData.data[0]).map(key => ({
    id: key,
    title: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }));
  
  const csvWriter = createCsvWriter({
    path: 'temp-report.csv',
    header: headers
  });
  
  await csvWriter.writeRecords(reportData.data);
  
  // Read the file and return as buffer
  const csvContent = fs.readFileSync('temp-report.csv');
  
  // Clean up temp file
  fs.unlinkSync('temp-report.csv');
  
  return csvContent;
};

/**
 * Generate Asset Inventory Report
 */
const generateAssetInventoryReport = async (dateRange) => {
  const { startDate, endDate } = getDateRange(dateRange);

  const assets = await prisma.asset.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate
      }
    },
    include: {
      category: true,
      subCategory: true,
      location: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return {
    reportType: 'Asset Inventory',
    dateRange,
    period: { startDate, endDate },
    totalAssets: assets.length,
    data: assets.map(asset => ({
      id: asset.id,
      assetName: asset.name,
      assetTag: asset.tagNumber,
      category: asset.category?.name || 'N/A',
      subCategory: asset.subCategory?.name || 'N/A',
      brand: asset.brand || 'N/A',
      location: asset.location?.company || 'N/A',
      locationCode: asset.locationCode,
      assetStatus: asset.assetStatus,
      assetCondition: asset.assetCondition,
      model: asset.model,
      serialNumber: asset.serialNumber || 'N/A',
      description: asset.description,
      price: asset.price,
      createdAt: asset.createdAt
    }))
  };
};

/**
 * Generate Asset Utilization Report
 */
const generateAssetUtilizationReport = async (dateRange) => {
  const { startDate, endDate } = getDateRange(dateRange);

  const assets = await prisma.asset.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate
      }
    },
    include: {
      category: true,
      subCategory: true,
      location: true
    }
  });

  // Calculate utilization statistics
  const totalAssets = assets.length;
  const inUseAssets = assets.filter(asset => asset.assetStatus === 'In Use').length;
  const underMaintenanceAssets = assets.filter(asset => asset.assetStatus === 'Under Maintenance').length;
  const idleAssets = assets.filter(asset => asset.assetStatus === 'Idle').length;

  const utilizationRate = totalAssets > 0 ? ((inUseAssets / totalAssets) * 100).toFixed(2) : 0;

  return {
    reportType: 'Asset Utilization',
    dateRange,
    period: { startDate, endDate },
    summary: {
      totalAssets,
      inUseAssets,
      underMaintenanceAssets,
      idleAssets,
      utilizationRate: `${utilizationRate}%`
    },
    data: assets.map(asset => ({
      id: asset.id,
      assetName: asset.name,
      assetTag: asset.tagNumber,
      category: asset.category?.name || 'N/A',
      subCategory: asset.subCategory?.name || 'N/A',
      location: asset.location?.company || 'N/A',
      locationCode: asset.locationCode,
      assetStatus: asset.assetStatus,
      assetCondition: asset.assetCondition,
      utilizationStatus: asset.assetStatus === 'In Use' ? 'Active' : 'Inactive'
    }))
  };
};

/**
 * Generate Maintenance History Report
 */
const generateMaintenanceHistoryReport = async (dateRange) => {
  const { startDate, endDate } = getDateRange(dateRange);

  // Get assets that were under maintenance during the period
  const maintenanceAssets = await prisma.asset.findMany({
    where: {
      assetStatus: 'Under Maintenance',
      updatedAt: {
        gte: startDate,
        lt: endDate
      }
    },
    include: {
      category: true,
      subCategory: true,
      location: true
    }
  });

  // Get all assets for maintenance history context
  const allAssets = await prisma.asset.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate
      }
    },
    include: {
      category: true,
      subCategory: true,
      location: true
    }
  });

  const maintenanceCount = maintenanceAssets.length;
  const totalAssets = allAssets.length;
  const maintenanceRate = totalAssets > 0 ? ((maintenanceCount / totalAssets) * 100).toFixed(2) : 0;

  return {
    reportType: 'Maintenance History',
    dateRange,
    period: { startDate, endDate },
    summary: {
      totalAssets,
      maintenanceAssets: maintenanceCount,
      maintenanceRate: `${maintenanceRate}%`
    },
    data: maintenanceAssets.map(asset => ({
      id: asset.id,
      assetName: asset.name,
      assetTag: asset.tagNumber,
      category: asset.category?.name || 'N/A',
      subCategory: asset.subCategory?.name || 'N/A',
      location: asset.location?.company || 'N/A',
      locationCode: asset.locationCode,
      assetStatus: asset.assetStatus,
      assetCondition: asset.assetCondition,
      lastUpdated: asset.updatedAt,
      maintenanceDate: asset.updatedAt
    }))
  };
};

/**
 * Generate Asset Location Report
 */
const generateAssetLocationReport = async (dateRange) => {
  const { startDate, endDate } = getDateRange(dateRange);

  const assets = await prisma.asset.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate
      }
    },
    include: {
      category: true,
      subCategory: true,
      location: true
    }
  });

  // Group assets by location
  const locationGroups = assets.reduce((acc, asset) => {
    const locationName = asset.location?.company || 'Unknown Location';
    if (!acc[locationName]) {
      acc[locationName] = [];
    }
    acc[locationName].push(asset);
    return acc;
  }, {});

  const locationSummary = Object.keys(locationGroups).map(locationName => ({
    location: locationName,
    assetCount: locationGroups[locationName].length,
    assets: locationGroups[locationName].map(asset => ({
      id: asset.id,
      assetName: asset.name,
      assetTag: asset.tagNumber,
      category: asset.category?.name || 'N/A',
      subCategory: asset.subCategory?.name || 'N/A',
      locationCode: asset.locationCode,
      assetStatus: asset.assetStatus,
      assetCondition: asset.assetCondition
    }))
  }));

  return {
    reportType: 'Asset Location',
    dateRange,
    period: { startDate, endDate },
    totalAssets: assets.length,
    totalLocations: Object.keys(locationGroups).length,
    data: locationSummary
  };
};

/**
 * Main function to generate reports based on type
 */
exports.generateReport = async (req, res) => {
  try {
    // Validate request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { reportType, dateRange, format } = req.body;

    let reportData;

    // Generate report based on type
    switch (reportType) {
      case 'Asset Inventory':
        reportData = await generateAssetInventoryReport(dateRange);
        break;
      case 'Asset Utilization':
        reportData = await generateAssetUtilizationReport(dateRange);
        break;
      case 'Maintenance History':
        reportData = await generateMaintenanceHistoryReport(dateRange);
        break;
      case 'Asset Location':
        reportData = await generateAssetLocationReport(dateRange);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Supported types: Asset Inventory, Asset Utilization, Maintenance History, Asset Location'
        });
    }

    // Add metadata
    reportData.generatedAt = new Date();
    reportData.format = format || 'JSON';

    // Return response based on format
    if (format === 'PDF') {
      try {
        const htmlBuffer = await generatePDFReport(reportData);
        const filename = `${reportData.reportType.replace(/\s+/g, '_')}_${dateRange}_${new Date().getTime()}.html`;
        
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', htmlBuffer.length);
        res.send(htmlBuffer);
      } catch (error) {
        console.error('Error generating HTML report:', error);
        
        // Fallback: Return JSON with error note
        res.status(200).json({
          success: true,
          message: 'HTML report generation failed, returning JSON format instead',
          reportData,
          note: 'HTML report generation encountered an error. Please try Excel or CSV format instead.',
          error: error.message
        });
      }
    } else if (format === 'Excel') {
      try {
        const excelBuffer = await generateExcelReport(reportData);
        const filename = `${reportData.reportType.replace(/\s+/g, '_')}_${dateRange}_${new Date().getTime()}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        res.send(excelBuffer);
      } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to generate Excel report',
          error: error.message
        });
      }
    } else if (format === 'CSV') {
      try {
        const csvBuffer = await generateCSVReport(reportData);
        const filename = `${reportData.reportType.replace(/\s+/g, '_')}_${dateRange}_${new Date().getTime()}.csv`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', csvBuffer.length);
        res.send(csvBuffer);
      } catch (error) {
        console.error('Error generating CSV:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to generate CSV report',
          error: error.message
        });
      }
    } else {
      // JSON format - also make it downloadable
      try {
        const jsonContent = JSON.stringify({
          success: true,
          message: 'Report generated successfully',
          reportData
        }, null, 2);
        
        const filename = `${reportData.reportType.replace(/\s+/g, '_')}_${dateRange}_${new Date().getTime()}.json`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(jsonContent, 'utf8'));
        res.send(jsonContent);
      } catch (error) {
        console.error('Error generating JSON file:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to generate JSON report',
          error: error.message
        });
      }
    }

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
};

/**
 * Get available report types
 */
exports.getReportTypes = async (req, res) => {
  try {
    const reportTypes = [
      {
        value: 'Asset Inventory',
        label: 'Asset Inventory',
        description: 'Complete list of all assets with their details'
      },
      {
        value: 'Asset Utilization',
        label: 'Asset Utilization',
        description: 'Asset usage statistics and utilization rates'
      },
      {
        value: 'Maintenance History',
        label: 'Maintenance History',
        description: 'Assets under maintenance and maintenance history'
      },
      {
        value: 'Asset Location',
        label: 'Asset Location',
        description: 'Assets grouped by their locations'
      }
    ];

    res.status(200).json({
      success: true,
      data: reportTypes
    });
  } catch (error) {
    console.error('Error fetching report types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report types',
      error: error.message
    });
  }
};

/**
 * Get available date ranges
 */
exports.getDateRanges = async (req, res) => {
  try {
    const dateRanges = [
      {
        value: 'today',
        label: 'Today',
        description: 'Data from today only'
      },
      {
        value: 'thisWeek',
        label: 'This Week',
        description: 'Data from the current week'
      },
      {
        value: 'thisMonth',
        label: 'This Month',
        description: 'Data from the current month'
      },
      {
        value: 'thisQuarter',
        label: 'This Quarter',
        description: 'Data from the current quarter'
      },
      {
        value: 'thisYear',
        label: 'This Year',
        description: 'Data from the current year'
      }
    ];

    res.status(200).json({
      success: true,
      data: dateRanges
    });
  } catch (error) {
    console.error('Error fetching date ranges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch date ranges',
      error: error.message
    });
  }
};

/**
 * Get available formats
 */
exports.getFormats = async (req, res) => {
  try {
    const formats = [
      {
        value: 'JSON',
        label: 'JSON',
        description: 'JSON format for API consumption'
      },
      {
        value: 'PDF',
        label: 'PDF',
        description: 'PDF document format'
      },
      {
        value: 'Excel',
        label: 'Excel',
        description: 'Excel spreadsheet format'
      },
      {
        value: 'CSV',
        label: 'CSV',
        description: 'Comma-separated values format'
      }
    ];

    res.status(200).json({
      success: true,
      data: formats
    });
  } catch (error) {
    console.error('Error fetching formats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch formats',
      error: error.message
    });
  }
};
