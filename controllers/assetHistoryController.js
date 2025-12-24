const prisma = require('../prisma/client');

/**
 * Get complete asset history with filters
 * Supports filtering by: date range, event type, performed by, sort order
 */
exports.getAssetHistory = async (req, res) => {
  try {
    const { assetId } = req.params;
    const {
      startDate,
      endDate,
      eventType, // MAINTENANCE, INSPECTION, FUEL, ISSUE, ASSIGNMENT, TRANSFER, UPDATE
      performedBy, // userId or employeeId
      sortOrder = 'newest' // 'newest' or 'oldest'
    } = req.query;

    // Validate assetId
    if (!assetId) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID is required'
      });
    }

    // Check if asset exists
    const asset = await prisma.newAsset.findUnique({
      where: { id: parseInt(assetId) },
      include: {
        assetCategory: true,
        department: true,
        employee: true,
        assetCondition: true,
        location: true
      }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Collect all events
    const events = [];

    // 1. MAINTENANCE events from LogMaintenance
    if (!eventType || eventType === 'MAINTENANCE') {
      const maintenanceWhere = {
        newAssetId: parseInt(assetId)
      };

      if (Object.keys(dateFilter).length > 0) {
        maintenanceWhere.startDate = dateFilter;
      }

      if (performedBy) {
        maintenanceWhere.technicianId = parseInt(performedBy);
      }

      const maintenances = await prisma.logMaintenance.findMany({
        where: maintenanceWhere,
        include: {
          technician: true,
          maintenance: true
        },
        orderBy: { startDate: sortOrder === 'newest' ? 'desc' : 'asc' }
      });

      maintenances.forEach(maintenance => {
        events.push({
          id: `MAINT-${maintenance.id}`,
          eventType: 'MAINTENANCE',
          title: maintenance.issueDescription || 'Maintenance Service',
          details: `Priority: ${maintenance.priorityLevel}${maintenance.currentCondition ? ` | Condition: ${maintenance.currentCondition}` : ''}`,
          performer: {
            id: maintenance.technician.id,
            name: maintenance.technician.name_en || maintenance.technician.name_ar,
            initials: getInitials(maintenance.technician.name_en || maintenance.technician.name_ar)
          },
          date: maintenance.startDate,
          reference: `WO-${maintenance.id}`,
          attachments: null,
          rawData: maintenance
        });
      });
    }

    // 2. INSPECTION events from NewAssetCondition updates (asset condition changes)
    if (!eventType || eventType === 'INSPECTION') {
      // We'll track condition changes by looking at updatedAt timestamps
      // For now, we'll create inspection events based on asset condition updates
      // This is a simplified approach - you might want to add an Inspection model
      if (asset.updatedAt && (!startDate || new Date(asset.updatedAt) >= new Date(startDate)) &&
          (!endDate || new Date(asset.updatedAt) <= new Date(endDate))) {
        events.push({
          id: `INSP-${asset.id}`,
          eventType: 'INSPECTION',
          title: 'Routine Inspection Completed',
          details: `Condition: ${asset.assetCondition?.name || 'N/A'}`,
          performer: {
            id: null,
            name: 'System',
            initials: 'SYS'
          },
          date: asset.updatedAt,
          reference: `INS-${new Date(asset.updatedAt).getFullYear()}-${String(asset.id).padStart(3, '0')}`,
          attachments: null,
          rawData: asset
        });
      }
    }

    // 3. ISSUE events from LogMaintenance with high priority
    // Only add if specifically requesting ISSUE type, or if not filtering by type
    // But avoid duplicates with MAINTENANCE events
    if (eventType === 'ISSUE') {
      const issueWhere = {
        newAssetId: parseInt(assetId),
        priorityLevel: {
          in: ['HIGH', 'CRITICAL', 'URGENT']
        }
      };

      if (Object.keys(dateFilter).length > 0) {
        issueWhere.startDate = dateFilter;
      }

      if (performedBy) {
        issueWhere.technicianId = parseInt(performedBy);
      }

      const issues = await prisma.logMaintenance.findMany({
        where: issueWhere,
        include: {
          technician: true
        },
        orderBy: { startDate: sortOrder === 'newest' ? 'desc' : 'asc' }
      });

      issues.forEach(issue => {
        events.push({
          id: `ISSUE-${issue.id}`,
          eventType: 'ISSUE',
          title: issue.issueDescription,
          details: `Priority: ${issue.priorityLevel}`,
          performer: {
            id: issue.technician.id,
            name: issue.technician.name_en || issue.technician.name_ar,
            initials: getInitials(issue.technician.name_en || issue.technician.name_ar)
          },
          date: issue.startDate,
          reference: `ISS-${String(issue.id).padStart(3, '0')}`,
          attachments: null,
          rawData: issue
        });
      });
    }

    // 4. ASSIGNMENT events (when asset was assigned to employee)
    if (!eventType || eventType === 'ASSIGNMENT') {
      if (asset.employee && asset.createdAt &&
          (!startDate || new Date(asset.createdAt) >= new Date(startDate)) &&
          (!endDate || new Date(asset.createdAt) <= new Date(endDate))) {
        if (!performedBy || asset.employeeId === parseInt(performedBy)) {
          events.push({
            id: `ASSIGN-${asset.id}`,
            eventType: 'ASSIGNMENT',
            title: 'Assigned to New Driver',
            details: `Assigned to: ${asset.employee.firstName} ${asset.employee.lastName}`,
            performer: {
              id: null,
              name: 'Admin User',
              initials: 'AU'
            },
            date: asset.createdAt,
            reference: null,
            attachments: null,
            rawData: asset
          });
        }
      }
    }

    // 5. TRANSFER events (when asset location or department changes)
    // Note: For NewAsset, transfers might be tracked via location/department changes
    // You might want to add a TransferHistory model to track these changes
    if (!eventType || eventType === 'TRANSFER') {
      if (asset.updatedAt && asset.location && asset.department &&
          (!startDate || new Date(asset.updatedAt) >= new Date(startDate)) &&
          (!endDate || new Date(asset.updatedAt) <= new Date(endDate))) {
        events.push({
          id: `TRANSFER-${asset.id}`,
          eventType: 'TRANSFER',
          title: 'Department Transfer',
          details: `Location: ${asset.location.name || asset.locationId} | Department: ${asset.department.departmentName}`,
          performer: {
            id: null,
            name: 'Admin User',
            initials: 'AU'
          },
          date: asset.updatedAt,
          reference: `TRF-${String(asset.id).padStart(3, '0')}`,
          attachments: null,
          rawData: asset
        });
      }
    }

    // 6. UPDATE events (general asset updates)
    if (!eventType || eventType === 'UPDATE') {
      if (asset.updatedAt && asset.createdAt &&
          asset.updatedAt.getTime() !== asset.createdAt.getTime() &&
          (!startDate || new Date(asset.updatedAt) >= new Date(startDate)) &&
          (!endDate || new Date(asset.updatedAt) <= new Date(endDate))) {
        events.push({
          id: `UPDATE-${asset.id}`,
          eventType: 'UPDATE',
          title: 'Asset Information Updated',
          details: 'Asset details were modified',
          performer: {
            id: null,
            name: 'System',
            initials: 'SYS'
          },
          date: asset.updatedAt,
          reference: null,
          attachments: null,
          rawData: asset
        });
      }
    }

    // Sort events by date
    events.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    // Filter by performedBy if specified (for events that have performer)
    let filteredEvents = events;
    if (performedBy && eventType !== 'ASSIGNMENT' && eventType !== 'TRANSFER' && eventType !== 'UPDATE') {
      filteredEvents = events.filter(event => 
        event.performer && event.performer.id && event.performer.id === parseInt(performedBy)
      );
    }

    res.status(200).json({
      success: true,
      asset: {
        id: asset.id,
        name: asset.name,
        serialNo: asset.serialNo,
        status: asset.status,
        assetType: asset.assetCategory?.name || 'N/A',
        makeModel: `${asset.name} ${asset.serialNo}`,
        department: asset.department?.departmentName || 'N/A',
        assignedTo: asset.employee ? `${asset.employee.firstName} ${asset.employee.lastName}` : 'N/A',
        condition: asset.assetCondition?.name || 'N/A',
        lastUpdated: asset.updatedAt
      },
      events: filteredEvents,
      totalEvents: filteredEvents.length,
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        eventType: eventType || 'All Events',
        performedBy: performedBy || 'All Users',
        sortOrder: sortOrder
      }
    });
  } catch (error) {
    console.error('Error retrieving asset history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get event distribution (for donut chart)
 */
exports.getEventDistribution = async (req, res) => {
  try {
    const { assetId } = req.params;
    const { startDate, endDate } = req.query;

    if (!assetId) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID is required'
      });
    }

    // Count events by type
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const [maintenanceCount, inspectionCount, issueCount, assignmentCount, transferCount, updateCount] = await Promise.all([
      // Maintenance count
      prisma.logMaintenance.count({
        where: {
          newAssetId: parseInt(assetId),
          ...(Object.keys(dateFilter).length > 0 && { startDate: dateFilter })
        }
      }),
      // Inspection count (simplified - based on condition updates)
      1, // Placeholder - you might want to add an Inspection model
      // Issue count (high priority maintenances)
      prisma.logMaintenance.count({
        where: {
          newAssetId: parseInt(assetId),
          priorityLevel: { in: ['HIGH', 'CRITICAL', 'URGENT'] },
          ...(Object.keys(dateFilter).length > 0 && { startDate: dateFilter })
        }
      }),
      // Assignment count (asset creation/assignment)
      1, // Placeholder
      // Transfer count
      1, // Placeholder
      // Update count
      1 // Placeholder
    ]);

    const total = maintenanceCount + inspectionCount + issueCount + assignmentCount + transferCount + updateCount;

    const distribution = [
      {
        type: 'Inspection',
        count: inspectionCount,
        percentage: total > 0 ? ((inspectionCount / total) * 100).toFixed(1) : 0,
        color: '#3B82F6' // Blue
      },
      {
        type: 'Maintenance',
        count: maintenanceCount,
        percentage: total > 0 ? ((maintenanceCount / total) * 100).toFixed(1) : 0,
        color: '#F97316' // Orange
      },
      {
        type: 'Fuel',
        count: 0, // Placeholder - you might need to link FuelLevel to assets
        percentage: 0,
        color: '#10B981' // Green
      },
      {
        type: 'Issue',
        count: issueCount,
        percentage: total > 0 ? ((issueCount / total) * 100).toFixed(1) : 0,
        color: '#EF4444' // Red
      },
      {
        type: 'Assignment',
        count: assignmentCount,
        percentage: total > 0 ? ((assignmentCount / total) * 100).toFixed(1) : 0,
        color: '#8B5CF6' // Purple
      },
      {
        type: 'Transfer',
        count: transferCount,
        percentage: total > 0 ? ((transferCount / total) * 100).toFixed(1) : 0,
        color: '#14B8A6' // Teal
      },
      {
        type: 'Update',
        count: updateCount,
        percentage: total > 0 ? ((updateCount / total) * 100).toFixed(1) : 0,
        color: '#6B7280' // Gray
      }
    ].filter(item => item.count > 0); // Only return types with events

    res.status(200).json({
      success: true,
      distribution,
      total
    });
  } catch (error) {
    console.error('Error retrieving event distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get summary statistics
 */
exports.getSummaryStatistics = async (req, res) => {
  try {
    const { assetId } = req.params;
    const { startDate, endDate } = req.query;

    if (!assetId) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID is required'
      });
    }

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Get all maintenance records for this asset
    const maintenanceWhere = {
      newAssetId: parseInt(assetId),
      ...(Object.keys(dateFilter).length > 0 && { startDate: dateFilter })
    };

    const [allMaintenances, highPriorityMaintenances] = await Promise.all([
      // All maintenances
      prisma.logMaintenance.count({ where: maintenanceWhere }),
      // High priority (issues)
      prisma.logMaintenance.count({
        where: {
          ...maintenanceWhere,
          priorityLevel: { in: ['HIGH', 'CRITICAL', 'URGENT'] }
        }
      })
    ]);

    // Calculate counts
    const maintenances = allMaintenances;
    const issues = highPriorityMaintenances;
    const inspections = 0; // Placeholder - add Inspection model if needed
    const fuelEntries = 0; // Placeholder - link FuelLevel to assets if needed
    const totalEvents = maintenances + inspections + fuelEntries;

    res.status(200).json({
      success: true,
      statistics: {
        totalEvents: totalEvents || maintenances, // Use maintenances as fallback
        inspections,
        maintenances,
        fuelEntries,
        issues // Additional stat for issues
      }
    });
  } catch (error) {
    console.error('Error retrieving summary statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get smart insights
 */
exports.getSmartInsights = async (req, res) => {
  try {
    const { assetId } = req.params;
    const { startDate, endDate } = req.query;

    if (!assetId) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID is required'
      });
    }

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Get all maintenance events
    const maintenances = await prisma.logMaintenance.findMany({
      where: {
        newAssetId: parseInt(assetId),
        ...(Object.keys(dateFilter).length > 0 && { startDate: dateFilter })
      },
      include: {
        technician: true
      },
      orderBy: { startDate: 'desc' }
    });

    // Calculate insights
    const eventTypeCounts = {};
    maintenances.forEach(m => {
      const type = m.priorityLevel || 'MAINTENANCE';
      eventTypeCounts[type] = (eventTypeCounts[type] || 0) + 1;
    });

    const mostFrequentType = Object.keys(eventTypeCounts).reduce((a, b) =>
      eventTypeCounts[a] > eventTypeCounts[b] ? a : b, 'Maintenance'
    );
    const mostFrequentCount = eventTypeCounts[mostFrequentType] || 0;
    const totalEvents = maintenances.length;
    const mostFrequentPercentage = totalEvents > 0 ? ((mostFrequentCount / totalEvents) * 100).toFixed(0) : 0;

    // Calculate average time between inspections/maintenances
    let avgTimeBetween = 0;
    if (maintenances.length > 1) {
      const timeDiffs = [];
      for (let i = 0; i < maintenances.length - 1; i++) {
        const diff = Math.abs(new Date(maintenances[i].startDate) - new Date(maintenances[i + 1].startDate));
        timeDiffs.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
      }
      avgTimeBetween = Math.round(timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length);
    }

    // Find top technician
    const technicianCounts = {};
    maintenances.forEach(m => {
      if (m.technician) {
        const techName = m.technician.name_en || m.technician.name_ar;
        technicianCounts[techName] = (technicianCounts[techName] || 0) + 1;
      }
    });

    const topTechnician = Object.keys(technicianCounts).reduce((a, b) =>
      technicianCounts[a] > technicianCounts[b] ? a : b, null
    );
    const topTechnicianCount = topTechnician ? technicianCounts[topTechnician] : 0;

    res.status(200).json({
      success: true,
      insights: {
        mostFrequentEventType: `${mostFrequentType} (${mostFrequentPercentage}%)`,
        averageTimeBetweenInspections: `${avgTimeBetween} days`,
        topTechnician: topTechnician ? `${topTechnician} (${topTechnicianCount} events)` : 'N/A'
      }
    });
  } catch (error) {
    console.error('Error retrieving smart insights:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Helper function to get initials from name
 */
function getInitials(name) {
  if (!name) return 'NA';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

