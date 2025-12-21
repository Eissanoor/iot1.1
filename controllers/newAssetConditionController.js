const prisma = require('../prisma/client');

/**
 * Get statistics for asset condition cards
 * Returns data for:
 * - New Assets (assets created in last 30 days)
 * - Good Condition
 * - Fair Condition
 * - Damaged
 * - Retired
 */
exports.getAssetConditionStats = async (req, res) => {
  try {
    // Get total count of all assets
    const totalAssets = await prisma.newAsset.count();

    // Calculate date ranges for comparison (30 days ago for new assets, previous period for trends)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get all asset conditions to map by name
    const assetConditions = await prisma.assetCondition.findMany({
      where: { status: true }
    });

    // Create a map of condition names to IDs
    const conditionMap = {};
    assetConditions.forEach(condition => {
      conditionMap[condition.name.toLowerCase()] = condition.id;
    });

    // Helper function to get condition ID by name (case-insensitive)
    const getConditionId = (name) => {
      return conditionMap[name.toLowerCase()] || null;
    };

    // Get counts for each condition
    const goodConditionId = getConditionId('Good Condition') || getConditionId('Good');
    const fairConditionId = getConditionId('Fair Condition') || getConditionId('Fair');
    const damagedConditionId = getConditionId('Damaged');
    const retiredConditionId = getConditionId('Retired');

    // Get current period counts
    const [
      newAssetsCount,
      goodConditionCount,
      fairConditionCount,
      damagedCount,
      retiredCount
    ] = await Promise.all([
      // New Assets: assets created in last 30 days
      prisma.newAsset.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      // Good Condition
      goodConditionId ? prisma.newAsset.count({
        where: {
          assetConditionId: goodConditionId
        }
      }) : 0,
      // Fair Condition
      fairConditionId ? prisma.newAsset.count({
        where: {
          assetConditionId: fairConditionId
        }
      }) : 0,
      // Damaged
      damagedConditionId ? prisma.newAsset.count({
        where: {
          assetConditionId: damagedConditionId
        }
      }) : 0,
      // Retired
      retiredConditionId ? prisma.newAsset.count({
        where: {
          assetConditionId: retiredConditionId
        }
      }) : 0
    ]);

    // Get previous period counts for trend calculation
    // For conditions, we'll compare with counts from 30 days ago
    const [
      previousNewAssetsCount,
      previousGoodConditionCount,
      previousFairConditionCount,
      previousDamagedCount,
      previousRetiredCount
    ] = await Promise.all([
      // Previous period new assets (30-60 days ago)
      prisma.newAsset.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      }),
      // Previous period good condition (assets that existed 30 days ago with this condition)
      goodConditionId ? prisma.newAsset.count({
        where: {
          assetConditionId: goodConditionId,
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      }) : 0,
      // Previous period fair condition
      fairConditionId ? prisma.newAsset.count({
        where: {
          assetConditionId: fairConditionId,
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      }) : 0,
      // Previous period damaged
      damagedConditionId ? prisma.newAsset.count({
        where: {
          assetConditionId: damagedConditionId,
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      }) : 0,
      // Previous period retired
      retiredConditionId ? prisma.newAsset.count({
        where: {
          assetConditionId: retiredConditionId,
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      }) : 0
    ]);

    // Helper function to calculate percentage
    const calculatePercentage = (count, total) => {
      if (total === 0) return 0;
      return parseFloat(((count / total) * 100).toFixed(1));
    };

    // Helper function to calculate trend percentage
    const calculateTrendPercentage = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    };

    // Helper function to get trend direction
    const getTrendDirection = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 'up' : 'neutral';
      }
      const change = current - previous;
      if (change > 0) return 'up';
      if (change < 0) return 'down';
      return 'neutral';
    };

    // Calculate percentages
    const newAssetsPercentage = calculatePercentage(newAssetsCount, totalAssets);
    const goodConditionPercentage = calculatePercentage(goodConditionCount, totalAssets);
    const fairConditionPercentage = calculatePercentage(fairConditionCount, totalAssets);
    const damagedPercentage = calculatePercentage(damagedCount, totalAssets);
    const retiredPercentage = calculatePercentage(retiredCount, totalAssets);

    // Calculate trend percentages and directions
    const newAssetsTrendPct = calculateTrendPercentage(newAssetsCount, previousNewAssetsCount);
    const goodConditionTrendPct = calculateTrendPercentage(goodConditionCount, previousGoodConditionCount);
    const fairConditionTrendPct = calculateTrendPercentage(fairConditionCount, previousFairConditionCount);
    const damagedTrendPct = calculateTrendPercentage(damagedCount, previousDamagedCount);
    const retiredTrendPct = calculateTrendPercentage(retiredCount, previousRetiredCount);

    const newAssetsTrend = getTrendDirection(newAssetsCount, previousNewAssetsCount);
    const goodConditionTrend = getTrendDirection(goodConditionCount, previousGoodConditionCount);
    const fairConditionTrend = getTrendDirection(fairConditionCount, previousFairConditionCount);
    const damagedTrend = getTrendDirection(damagedCount, previousDamagedCount);
    const retiredTrend = getTrendDirection(retiredCount, previousRetiredCount);

    // Prepare response data matching the card structure
    const response = {
      success: true,
      data: {
        newAssets: {
          count: newAssetsCount,
          label: 'New Assets',
          percentage: newAssetsPercentage,
          trend: newAssetsTrend,
          trendPercentage: Math.abs(newAssetsTrendPct),
          color: 'green'
        },
        goodCondition: {
          count: goodConditionCount,
          label: 'Good Condition',
          percentage: goodConditionPercentage,
          trend: goodConditionTrend,
          trendPercentage: Math.abs(goodConditionTrendPct),
          color: 'blue'
        },
        fairCondition: {
          count: fairConditionCount,
          label: 'Fair Condition',
          percentage: fairConditionPercentage,
          trend: fairConditionTrend,
          trendPercentage: Math.abs(fairConditionTrendPct),
          color: 'orange'
        },
        damaged: {
          count: damagedCount,
          label: 'Damaged',
          percentage: damagedPercentage,
          trend: damagedTrend,
          trendPercentage: Math.abs(damagedTrendPct),
          color: 'red'
        },
        retired: {
          count: retiredCount,
          label: 'Retired',
          percentage: retiredPercentage,
          trend: retiredTrend,
          trendPercentage: Math.abs(retiredTrendPct),
          color: 'gray'
        },
        totalAssets: totalAssets
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching asset condition statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset condition statistics',
      error: error.message
    });
  }
};

/**
 * Get Condition Trend data for the last 6 months
 * Returns monthly data for Good, Fair, and Damaged conditions
 */
exports.getConditionTrend = async (req, res) => {
  try {
    // Get all asset conditions to map by name
    const assetConditions = await prisma.assetCondition.findMany({
      where: { status: true }
    });

    // Create a map of condition names to IDs
    const conditionMap = {};
    assetConditions.forEach(condition => {
      conditionMap[condition.name.toLowerCase()] = condition.id;
    });

    const getConditionId = (name) => {
      return conditionMap[name.toLowerCase()] || null;
    };

    const goodConditionId = getConditionId('Good Condition') || getConditionId('Good');
    const fairConditionId = getConditionId('Fair Condition') || getConditionId('Fair');
    const damagedConditionId = getConditionId('Damaged');

    // Calculate date range for last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Generate array of months (last 6 months)
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        name: monthNames[date.getMonth()],
        year: date.getFullYear(),
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
      });
    }

    // Get data for each month (cumulative count up to end of each month)
    const monthlyData = await Promise.all(
      months.map(async (month) => {
        const [goodCount, fairCount, damagedCount] = await Promise.all([
          goodConditionId ? prisma.newAsset.count({
            where: {
              assetConditionId: goodConditionId,
              createdAt: {
                lte: month.endDate
              }
            }
          }) : 0,
          fairConditionId ? prisma.newAsset.count({
            where: {
              assetConditionId: fairConditionId,
              createdAt: {
                lte: month.endDate
              }
            }
          }) : 0,
          damagedConditionId ? prisma.newAsset.count({
            where: {
              assetConditionId: damagedConditionId,
              createdAt: {
                lte: month.endDate
              }
            }
          }) : 0
        ]);

        return {
          month: month.name,
          good: goodCount,
          fair: fairCount,
          damaged: damagedCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        title: 'Condition Trend (Last 6 Months)',
        labels: monthlyData.map(d => d.month),
        datasets: [
          {
            label: 'Good',
            data: monthlyData.map(d => d.good),
            color: '#3B82F6' // Blue
          },
          {
            label: 'Fair',
            data: monthlyData.map(d => d.fair),
            color: '#F97316' // Orange
          },
          {
            label: 'Damaged',
            data: monthlyData.map(d => d.damaged),
            color: '#EF4444' // Red
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching condition trend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch condition trend data',
      error: error.message
    });
  }
};

/**
 * Get Condition by Category data for donut chart
 * Returns distribution of assets by category
 */
exports.getConditionByCategory = async (req, res) => {
  try {
    // Get all assets with their categories and conditions
    const assets = await prisma.newAsset.findMany({
      include: {
        assetCategory: true,
        assetCondition: true
      }
    });

    // Group by category
    const categoryMap = {};
    
    assets.forEach(asset => {
      const categoryName = asset.assetCategory?.name || 'Unknown';
      
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          name: categoryName,
          count: 0
        };
      }
      categoryMap[categoryName].count++;
    });

    // Convert to array and sort by count
    const categoryData = Object.values(categoryMap)
      .sort((a, b) => b.count - a.count);

    // Calculate total for percentage calculation
    const total = assets.length;

    // Assign colors to categories
    const colors = ['#3B82F6', '#8B5CF6', '#6B7280', '#EF4444', '#10B981']; // Blue, Purple, Gray, Red, Green
    const categoryColors = {
      'Electronics': '#3B82F6', // Blue
      'Office': '#8B5CF6', // Purple
      'Tools': '#6B7280', // Gray
      'Vehicles': '#EF4444', // Red
      'Supplies': '#10B981' // Green
    };

    const formattedData = categoryData.map((category, index) => ({
      name: category.name,
      value: category.count,
      percentage: total > 0 ? parseFloat(((category.count / total) * 100).toFixed(1)) : 0,
      color: categoryColors[category.name] || colors[index % colors.length]
    }));

    res.status(200).json({
      success: true,
      data: {
        title: 'Condition by Category',
        categories: formattedData,
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching condition by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch condition by category data',
      error: error.message
    });
  }
};

/**
 * Get Department Health Score data for bar chart
 * Calculates health score based on asset conditions per department
 */
exports.getDepartmentHealthScore = async (req, res) => {
  try {
    // Get all asset conditions to map by name
    const assetConditions = await prisma.assetCondition.findMany({
      where: { status: true }
    });

    const conditionMap = {};
    assetConditions.forEach(condition => {
      conditionMap[condition.name.toLowerCase()] = condition.id;
    });

    const getConditionId = (name) => {
      return conditionMap[name.toLowerCase()] || null;
    };

    const goodConditionId = getConditionId('Good Condition') || getConditionId('Good');
    const fairConditionId = getConditionId('Fair Condition') || getConditionId('Fair');
    const damagedConditionId = getConditionId('Damaged');
    const retiredConditionId = getConditionId('Retired');

    // Get all departments
    const departments = await prisma.department.findMany({
      where: {
        status: { not: 'Inactive' }
      },
      include: {
        newAssets: {
          include: {
            assetCondition: true
          }
        }
      }
    });

    // Calculate health score for each department
    const departmentScores = departments.map(dept => {
      const assets = dept.newAssets || [];
      const totalAssets = assets.length;

      if (totalAssets === 0) {
        return {
          name: dept.departmentName,
          score: 0,
          totalAssets: 0
        };
      }

      // Count assets by condition
      const goodCount = assets.filter(a => 
        a.assetConditionId === goodConditionId
      ).length;
      const fairCount = assets.filter(a => 
        a.assetConditionId === fairConditionId
      ).length;
      const damagedCount = assets.filter(a => 
        a.assetConditionId === damagedConditionId
      ).length;
      const retiredCount = assets.filter(a => 
        a.assetConditionId === retiredConditionId
      ).length;

      // Calculate health score:
      // Good = 100 points, Fair = 50 points, Damaged = 0 points, Retired = 0 points
      // Score = (goodCount * 100 + fairCount * 50) / totalAssets
      const score = totalAssets > 0
        ? Math.round((goodCount * 100 + fairCount * 50) / totalAssets)
        : 0;

      return {
        name: dept.departmentName,
        score: Math.min(100, Math.max(0, score)), // Clamp between 0-100
        totalAssets: totalAssets,
        goodCount,
        fairCount,
        damagedCount,
        retiredCount
      };
    });

    // Sort by score descending
    departmentScores.sort((a, b) => b.score - a.score);

    // Assign colors based on score ranges
    const getColor = (score) => {
      if (score >= 80) return '#10B981'; // Green
      if (score >= 70) return '#F97316'; // Orange
      if (score >= 60) return '#3B82F6'; // Blue
      if (score >= 50) return '#EF4444'; // Red
      return '#8B5CF6'; // Purple
    };

    const formattedData = departmentScores.map(dept => ({
      name: dept.name,
      score: dept.score,
      color: getColor(dept.score),
      totalAssets: dept.totalAssets
    }));

    res.status(200).json({
      success: true,
      data: {
        title: 'Department Health Score',
        departments: formattedData
      }
    });
  } catch (error) {
    console.error('Error fetching department health score:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department health score data',
      error: error.message
    });
  }
};

/**
 * Get all assets with condition details for the Asset Condition Details page
 * Supports search, filtering, and pagination
 */
exports.getAssetConditionDetails = async (req, res) => {
  try {
    const {
      search,
      category,
      department,
      condition,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    // Search filter (searches in asset name and serial number)
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { serialNo: { contains: search } }
      ];
    }

    // Category filter
    if (category) {
      where.assetCategory = {
        name: { contains: category }
      };
    }

    // Department filter
    if (department) {
      where.department = {
        departmentName: { contains: department }
      };
    }

    // Condition filter
    if (condition) {
      where.assetCondition = {
        name: { contains: condition }
      };
    }

    // Get total count for pagination
    const total = await prisma.newAsset.count({ where });

    // Get assets with relations
    const assets = await prisma.newAsset.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        assetCategory: {
          select: {
            id: true,
            name: true
          }
        },
        department: {
          select: {
            id: true,
            departmentName: true
          }
        },
        assetCondition: {
          select: {
            id: true,
            name: true
          }
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        location: {
          select: {
            id: true,
            locationCode: true
          }
        }
      }
    });

    // Format response data
    const formattedAssets = assets.map(asset => {
      // Calculate lifecycle percentage based on purchase date and warranty expiry
      let lifecyclePercentage = 0;
      if (asset.purchaseDate && asset.warrantyExpiry) {
        const purchaseDate = new Date(asset.purchaseDate);
        const warrantyExpiry = new Date(asset.warrantyExpiry);
        const now = new Date();
        const totalDuration = warrantyExpiry - purchaseDate;
        const elapsed = now - purchaseDate;
        lifecyclePercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
      }

      // Get condition color
      const conditionName = asset.assetCondition?.name?.toLowerCase() || '';
      let conditionColor = '#6B7280'; // Default gray
      if (conditionName.includes('good')) conditionColor = '#3B82F6'; // Blue
      else if (conditionName.includes('fair')) conditionColor = '#F97316'; // Orange
      else if (conditionName.includes('damaged')) conditionColor = '#EF4444'; // Red
      else if (conditionName.includes('new')) conditionColor = '#10B981'; // Green
      else if (conditionName.includes('retired')) conditionColor = '#6B7280'; // Gray

      // Use updatedAt as last inspection date (or purchaseDate if updatedAt is not available)
      const lastInspection = asset.updatedAt || asset.purchaseDate || asset.createdAt;

      return {
        id: asset.id,
        assetName: asset.name,
        serialNo: asset.serialNo,
        category: asset.assetCategory?.name || 'Unknown',
        department: asset.department?.departmentName || 'Unknown',
        condition: asset.assetCondition?.name?.toUpperCase() || 'UNKNOWN',
        conditionColor: conditionColor,
        lifecycle: lifecyclePercentage,
        purchaseDate: asset.purchaseDate,
        warrantyExpiry: asset.warrantyExpiry,
        lastInspection: lastInspection,
        status: asset.status,
        image: asset.image,
        description: asset.description,
        employee: asset.employee ? `${asset.employee.firstName} ${asset.employee.lastName}` : null,
        location: asset.location?.locationCode || null
      };
    });

    res.status(200).json({
      success: true,
      data: formattedAssets,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching asset condition details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset condition details',
      error: error.message
    });
  }
};

/**
 * Get single asset condition details by ID
 */
exports.getAssetConditionDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const asset = await prisma.newAsset.findUnique({
      where: { id: parseInt(id) },
      include: {
        assetCategory: true,
        department: true,
        assetCondition: true,
        employee: true,
        location: true
      }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Calculate lifecycle percentage
    let lifecyclePercentage = 0;
    if (asset.purchaseDate && asset.warrantyExpiry) {
      const purchaseDate = new Date(asset.purchaseDate);
      const warrantyExpiry = new Date(asset.warrantyExpiry);
      const now = new Date();
      const totalDuration = warrantyExpiry - purchaseDate;
      const elapsed = now - purchaseDate;
      lifecyclePercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    }

    // Get condition color
    const conditionName = asset.assetCondition?.name?.toLowerCase() || '';
    let conditionColor = '#6B7280';
    if (conditionName.includes('good')) conditionColor = '#3B82F6';
    else if (conditionName.includes('fair')) conditionColor = '#F97316';
    else if (conditionName.includes('damaged')) conditionColor = '#EF4444';
    else if (conditionName.includes('new')) conditionColor = '#10B981';
    else if (conditionName.includes('retired')) conditionColor = '#6B7280';

    const lastInspection = asset.updatedAt || asset.purchaseDate || asset.createdAt;

    const formattedAsset = {
      id: asset.id,
      assetName: asset.name,
      serialNo: asset.serialNo,
      category: asset.assetCategory?.name || 'Unknown',
      department: asset.department?.departmentName || 'Unknown',
      condition: asset.assetCondition?.name?.toUpperCase() || 'UNKNOWN',
      conditionColor: conditionColor,
      lifecycle: lifecyclePercentage,
      purchaseDate: asset.purchaseDate,
      warrantyExpiry: asset.warrantyExpiry,
      lastInspection: lastInspection,
      status: asset.status,
      image: asset.image,
      description: asset.description,
      employee: asset.employee ? {
        id: asset.employee.id,
        name: `${asset.employee.firstName} ${asset.employee.lastName}`
      } : null,
      location: asset.location ? {
        id: asset.location.id,
        code: asset.location.locationCode
      } : null,
      assetCategory: asset.assetCategory,
      department: asset.department,
      assetCondition: asset.assetCondition
    };

    res.status(200).json({
      success: true,
      data: formattedAsset
    });
  } catch (error) {
    console.error('Error fetching asset condition detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset condition detail',
      error: error.message
    });
  }
};

/**
 * Schedule inspection for an asset
 * Updates the asset's updatedAt field to mark as inspected
 */
exports.scheduleInspection = async (req, res) => {
  try {
    const { assetId, inspectionDate, notes } = req.body;

    if (!assetId) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID is required'
      });
    }

    // Check if asset exists
    const asset = await prisma.newAsset.findUnique({
      where: { id: parseInt(assetId) }
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Update asset - set updatedAt to inspection date or current date
    const inspectionDateTime = inspectionDate ? new Date(inspectionDate) : new Date();

    const updatedAsset = await prisma.newAsset.update({
      where: { id: parseInt(assetId) },
      data: {
        updatedAt: inspectionDateTime,
        description: notes ? (asset.description ? `${asset.description}\n\nInspection: ${notes}` : `Inspection: ${notes}`) : asset.description
      },
      include: {
        assetCategory: true,
        department: true,
        assetCondition: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Inspection scheduled successfully',
      data: {
        assetId: updatedAsset.id,
        inspectionDate: updatedAsset.updatedAt,
        asset: updatedAsset
      }
    });
  } catch (error) {
    console.error('Error scheduling inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule inspection',
      error: error.message
    });
  }
};

/**
 * Export asset condition report
 * Returns data in JSON format (can be extended to CSV/Excel/PDF)
 */
exports.exportReport = async (req, res) => {
  try {
    const { format = 'json', category, department, condition } = req.query;

    // Build where clause
    const where = {};

    if (category) {
      where.assetCategory = {
        name: { contains: category }
      };
    }

    if (department) {
      where.department = {
        departmentName: { contains: department }
      };
    }

    if (condition) {
      where.assetCondition = {
        name: { contains: condition }
      };
    }

    // Get all assets matching filters
    const assets = await prisma.newAsset.findMany({
      where,
      include: {
        assetCategory: true,
        department: true,
        assetCondition: true,
        employee: true,
        location: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format data for export
    const exportData = assets.map(asset => {
      let lifecyclePercentage = 0;
      if (asset.purchaseDate && asset.warrantyExpiry) {
        const purchaseDate = new Date(asset.purchaseDate);
        const warrantyExpiry = new Date(asset.warrantyExpiry);
        const now = new Date();
        const totalDuration = warrantyExpiry - purchaseDate;
        const elapsed = now - purchaseDate;
        lifecyclePercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
      }

      return {
        'Asset Name': asset.name,
        'Serial Number': asset.serialNo,
        'Category': asset.assetCategory?.name || 'Unknown',
        'Department': asset.department?.departmentName || 'Unknown',
        'Condition': asset.assetCondition?.name || 'Unknown',
        'Status': asset.status,
        'Lifecycle %': lifecyclePercentage,
        'Purchase Date': asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A',
        'Warranty Expiry': asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A',
        'Last Inspection': asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString() : 'N/A',
        'Employee': asset.employee ? `${asset.employee.firstName} ${asset.employee.lastName}` : 'N/A',
        'Location': asset.location?.locationCode || 'N/A',
        'Description': asset.description || 'N/A'
      };
    });

    if (format === 'json') {
      res.status(200).json({
        success: true,
        data: exportData,
        total: exportData.length,
        exportedAt: new Date().toISOString()
      });
    } else {
      // For other formats (CSV, Excel, PDF), you would use libraries like csv-writer, exceljs, puppeteer
      // For now, return JSON
      res.status(200).json({
        success: true,
        message: 'Export format not yet implemented. Returning JSON format.',
        data: exportData,
        total: exportData.length,
        exportedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
};

/**
 * Get summary cards data for Asset Condition Details page
 * Returns counts for: Total Assets, Good Condition, Fair Condition, Damaged, New Assets, Upcoming Inspections
 */
exports.getSummaryCards = async (req, res) => {
  try {
    // Get all asset conditions to map by name
    const assetConditions = await prisma.assetCondition.findMany({
      where: { status: true }
    });

    const conditionMap = {};
    assetConditions.forEach(condition => {
      conditionMap[condition.name.toLowerCase()] = condition.id;
    });

    const getConditionId = (name) => {
      return conditionMap[name.toLowerCase()] || null;
    };

    const goodConditionId = getConditionId('Good Condition') || getConditionId('Good');
    const fairConditionId = getConditionId('Fair Condition') || getConditionId('Fair');
    const damagedConditionId = getConditionId('Damaged');
    const retiredConditionId = getConditionId('Retired');
    const newConditionId = getConditionId('New');

    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Get all counts in parallel
    const [
      totalAssets,
      goodConditionCount,
      fairConditionCount,
      damagedCount,
      retiredCount,
      newAssetsCount,
      upcomingInspectionsCount,
      assetsRequiringAttention
    ] = await Promise.all([
      // Total Assets
      prisma.newAsset.count(),
      
      // Good Condition
      goodConditionId ? prisma.newAsset.count({
        where: { assetConditionId: goodConditionId }
      }) : 0,
      
      // Fair Condition
      fairConditionId ? prisma.newAsset.count({
        where: { assetConditionId: fairConditionId }
      }) : 0,
      
      // Damaged
      damagedConditionId ? prisma.newAsset.count({
        where: { assetConditionId: damagedConditionId }
      }) : 0,
      
      // Retired
      retiredConditionId ? prisma.newAsset.count({
        where: { assetConditionId: retiredConditionId }
      }) : 0,
      
      // New Assets (created in last 30 days)
      prisma.newAsset.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      
      // Upcoming Inspections (assets updated more than 30 days ago, need inspection)
      prisma.newAsset.count({
        where: {
          updatedAt: {
            lt: thirtyDaysAgo
          }
        }
      }),
      
      // Assets Requiring Attention (Damaged + Fair condition)
      prisma.newAsset.count({
        where: {
          OR: [
            damagedConditionId ? { assetConditionId: damagedConditionId } : {},
            fairConditionId ? { assetConditionId: fairConditionId } : {}
          ].filter(condition => Object.keys(condition).length > 0)
        }
      })
    ]);

    // Calculate percentages
    const calculatePercentage = (count, total) => {
      if (total === 0) return 0;
      return parseFloat(((count / total) * 100).toFixed(1));
    };

    const response = {
      success: true,
      data: {
        totalAssets: {
          count: totalAssets,
          label: 'Total Assets',
          icon: 'assets',
          color: '#6366F1', // Indigo
          percentage: 100
        },
        goodCondition: {
          count: goodConditionCount,
          label: 'Good Condition',
          icon: 'check-circle',
          color: '#3B82F6', // Blue
          percentage: calculatePercentage(goodConditionCount, totalAssets)
        },
        fairCondition: {
          count: fairConditionCount,
          label: 'Fair Condition',
          icon: 'alert-circle',
          color: '#F97316', // Orange
          percentage: calculatePercentage(fairConditionCount, totalAssets)
        },
        damaged: {
          count: damagedCount,
          label: 'Damaged',
          icon: 'x-circle',
          color: '#EF4444', // Red
          percentage: calculatePercentage(damagedCount, totalAssets)
        },
        newAssets: {
          count: newAssetsCount,
          label: 'New Assets',
          icon: 'plus-circle',
          color: '#10B981', // Green
          percentage: calculatePercentage(newAssetsCount, totalAssets)
        },
        upcomingInspections: {
          count: upcomingInspectionsCount,
          label: 'Upcoming Inspections',
          icon: 'calendar',
          color: '#8B5CF6', // Purple
          percentage: calculatePercentage(upcomingInspectionsCount, totalAssets)
        },
        requiringAttention: {
          count: assetsRequiringAttention,
          label: 'Requiring Attention',
          icon: 'alert-triangle',
          color: '#F59E0B', // Amber
          percentage: calculatePercentage(assetsRequiringAttention, totalAssets)
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching summary cards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary cards',
      error: error.message
    });
  }
};

/**
 * Get assets requiring attention (Damaged + Fair condition)
 */
exports.getAssetsRequiringAttention = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get asset conditions
    const assetConditions = await prisma.assetCondition.findMany({
      where: { status: true }
    });

    const conditionMap = {};
    assetConditions.forEach(condition => {
      conditionMap[condition.name.toLowerCase()] = condition.id;
    });

    const getConditionId = (name) => {
      return conditionMap[name.toLowerCase()] || null;
    };

    const fairConditionId = getConditionId('Fair Condition') || getConditionId('Fair');
    const damagedConditionId = getConditionId('Damaged');

    const conditionIds = [];
    if (fairConditionId) conditionIds.push(fairConditionId);
    if (damagedConditionId) conditionIds.push(damagedConditionId);

    if (conditionIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: pageNum,
          limit: limitNum,
          totalPages: 0
        }
      });
    }

    const where = {
      assetConditionId: {
        in: conditionIds
      }
    };

    const total = await prisma.newAsset.count({ where });

    const assets = await prisma.newAsset.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        assetCategory: true,
        department: true,
        assetCondition: true,
        employee: true,
        location: true
      }
    });

    const formattedAssets = assets.map(asset => {
      let lifecyclePercentage = 0;
      if (asset.purchaseDate && asset.warrantyExpiry) {
        const purchaseDate = new Date(asset.purchaseDate);
        const warrantyExpiry = new Date(asset.warrantyExpiry);
        const now = new Date();
        const totalDuration = warrantyExpiry - purchaseDate;
        const elapsed = now - purchaseDate;
        lifecyclePercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
      }

      const conditionName = asset.assetCondition?.name?.toLowerCase() || '';
      let conditionColor = '#6B7280';
      if (conditionName.includes('good')) conditionColor = '#3B82F6';
      else if (conditionName.includes('fair')) conditionColor = '#F97316';
      else if (conditionName.includes('damaged')) conditionColor = '#EF4444';
      else if (conditionName.includes('new')) conditionColor = '#10B981';

      return {
        id: asset.id,
        assetName: asset.name,
        serialNo: asset.serialNo,
        category: asset.assetCategory?.name || 'Unknown',
        department: asset.department?.departmentName || 'Unknown',
        condition: asset.assetCondition?.name?.toUpperCase() || 'UNKNOWN',
        conditionColor: conditionColor,
        lifecycle: lifecyclePercentage,
        lastInspection: asset.updatedAt || asset.purchaseDate || asset.createdAt,
        priority: conditionName.includes('damaged') ? 'High' : 'Medium'
      };
    });

    res.status(200).json({
      success: true,
      data: formattedAssets,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching assets requiring attention:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets requiring attention',
      error: error.message
    });
  }
};

/**
 * Get upcoming inspections (assets that haven't been inspected in the last 30 days)
 */
exports.getUpcomingInspections = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const where = {
      updatedAt: {
        lt: thirtyDaysAgo
      }
    };

    const total = await prisma.newAsset.count({ where });

    const assets = await prisma.newAsset.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        updatedAt: 'asc' // Oldest first
      },
      include: {
        assetCategory: true,
        department: true,
        assetCondition: true,
        employee: true,
        location: true
      }
    });

    const formattedAssets = assets.map(asset => {
      const daysSinceInspection = Math.floor(
        (new Date() - new Date(asset.updatedAt)) / (1000 * 60 * 60 * 24)
      );

      let lifecyclePercentage = 0;
      if (asset.purchaseDate && asset.warrantyExpiry) {
        const purchaseDate = new Date(asset.purchaseDate);
        const warrantyExpiry = new Date(asset.warrantyExpiry);
        const now = new Date();
        const totalDuration = warrantyExpiry - purchaseDate;
        const elapsed = now - purchaseDate;
        lifecyclePercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
      }

      const conditionName = asset.assetCondition?.name?.toLowerCase() || '';
      let conditionColor = '#6B7280';
      if (conditionName.includes('good')) conditionColor = '#3B82F6';
      else if (conditionName.includes('fair')) conditionColor = '#F97316';
      else if (conditionName.includes('damaged')) conditionColor = '#EF4444';
      else if (conditionName.includes('new')) conditionColor = '#10B981';

      return {
        id: asset.id,
        assetName: asset.name,
        serialNo: asset.serialNo,
        category: asset.assetCategory?.name || 'Unknown',
        department: asset.department?.departmentName || 'Unknown',
        condition: asset.assetCondition?.name?.toUpperCase() || 'UNKNOWN',
        conditionColor: conditionColor,
        lifecycle: lifecyclePercentage,
        lastInspection: asset.updatedAt || asset.purchaseDate || asset.createdAt,
        daysSinceInspection: daysSinceInspection,
        inspectionDue: daysSinceInspection >= 30
      };
    });

    res.status(200).json({
      success: true,
      data: formattedAssets,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching upcoming inspections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming inspections',
      error: error.message
    });
  }
};

/**
 * Get filter options with counts for the filter sidebar
 * Returns condition statuses and categories with their respective counts
 */
exports.getFilterOptions = async (req, res) => {
  try {
    // Get all asset conditions
    const assetConditions = await prisma.assetCondition.findMany({
      where: { status: true },
      orderBy: { name: 'asc' }
    });

    // Get all asset categories
    const assetCategories = await prisma.assetCategory.findMany({
      where: { status: true },
      orderBy: { name: 'asc' }
    });

    // Get counts for each condition
    const conditionCounts = await Promise.all(
      assetConditions.map(async (condition) => {
        const count = await prisma.newAsset.count({
          where: {
            assetConditionId: condition.id
          }
        });

        // Determine color based on condition name
        const conditionName = condition.name.toLowerCase();
        let color = '#6B7280'; // Default gray
        if (conditionName.includes('new')) color = '#10B981'; // Green
        else if (conditionName.includes('good')) color = '#3B82F6'; // Blue
        else if (conditionName.includes('fair')) color = '#F97316'; // Orange
        else if (conditionName.includes('damaged')) color = '#EF4444'; // Red
        else if (conditionName.includes('retired')) color = '#6B7280'; // Gray

        return {
          id: condition.id,
          name: condition.name,
          count: count,
          color: color,
          checked: true // Default to checked
        };
      })
    );

    // Get counts for each category
    const categoryCounts = await Promise.all(
      assetCategories.map(async (category) => {
        const count = await prisma.newAsset.count({
          where: {
            assetCategoryId: category.id
          }
        });

        return {
          id: category.id,
          name: category.name,
          count: count,
          checked: true // Default to checked
        };
      })
    );

    // Sort conditions by predefined order: New, Good, Fair, Damaged, Retired
    const conditionOrder = ['new', 'good', 'fair', 'damaged', 'retired'];
    const sortedConditions = conditionCounts.sort((a, b) => {
      const aIndex = conditionOrder.findIndex(order => 
        a.name.toLowerCase().includes(order)
      );
      const bIndex = conditionOrder.findIndex(order => 
        b.name.toLowerCase().includes(order)
      );
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    res.status(200).json({
      success: true,
      data: {
        conditionStatus: sortedConditions,
        category: categoryCounts
      }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options',
      error: error.message
    });
  }
};

