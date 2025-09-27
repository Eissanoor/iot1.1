const prisma = require('../prisma/client');

// Controller methods for Technician CRUD operations
exports.createTechnician = async (req, res) => {
  try {
    const { 
      name_en,
      name_ar,
      status
    } = req.body;
    
    // Validate required fields
    if (!name_en || !name_ar) {
      return res.status(400).json({ 
        error: 'Required fields missing: name_en and name_ar are required' 
      });
    }
    
    // Create new technician
    const technician = await prisma.technician.create({
      data: {
        name_en,
        name_ar,
        status: status !== undefined ? parseInt(status) : 1
      }
    });
    
    res.status(201).json({ 
      message: 'Technician created successfully',
      technician
    });
  } catch (error) {
    console.error('Error creating technician:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllTechnicians = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 records per page
    const skip = (page - 1) * limit;
    const status = req.query.status ? parseInt(req.query.status) : undefined;
    const search = req.query.search;
    
    // Build filter object
    const where = {};
    if (status !== undefined) where.status = status;
    if (search) {
      where.OR = [
        { name_en: { contains: search, mode: 'insensitive' } },
        { name_ar: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get technicians with pagination, sort by createdAt descending (newest first)
    const technicians = await prisma.technician.findMany({
      where,
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    // Get total count
    const totalItems = await prisma.technician.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    
    res.status(200).json({
      pagination: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      technicians
    });
  } catch (error) {
    console.error('Error retrieving technicians:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTechnicianById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find technician by ID
    const technician = await prisma.technician.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    res.status(200).json(technician);
  } catch (error) {
    console.error('Error retrieving technician:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name_en,
      name_ar,
      status
    } = req.body;
    
    // Check if technician exists
    const existingTechnician = await prisma.technician.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingTechnician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    // Update technician
    const updatedTechnician = await prisma.technician.update({
      where: { id: parseInt(id) },
      data: {
        name_en: name_en !== undefined ? name_en : existingTechnician.name_en,
        name_ar: name_ar !== undefined ? name_ar : existingTechnician.name_ar,
        status: status !== undefined ? parseInt(status) : existingTechnician.status
      }
    });
    
    res.status(200).json({
      message: 'Technician updated successfully',
      technician: updatedTechnician
    });
  } catch (error) {
    console.error('Error updating technician:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if technician exists
    const existingTechnician = await prisma.technician.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingTechnician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    // Delete technician
    await prisma.technician.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'Technician deleted successfully' });
  } catch (error) {
    console.error('Error deleting technician:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get active technicians only (status = 1)
exports.getActiveTechnicians = async (req, res) => {
  try {
    const technicians = await prisma.technician.findMany({
      where: { status: 1 },
      orderBy: { name_en: 'asc' }
    });
    
    res.status(200).json({
      technicians,
      totalCount: technicians.length
    });
  } catch (error) {
    console.error('Error retrieving active technicians:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update technician status
exports.updateTechnicianStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status value
    if (status === undefined || (status !== 0 && status !== 1)) {
      return res.status(400).json({ 
        error: 'Status is required and must be 0 (inactive) or 1 (active)' 
      });
    }
    
    // Check if technician exists
    const existingTechnician = await prisma.technician.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingTechnician) {
      return res.status(404).json({ message: 'Technician not found' });
    }
    
    // Update technician status
    const updatedTechnician = await prisma.technician.update({
      where: { id: parseInt(id) },
      data: { status: parseInt(status) }
    });
    
    res.status(200).json({
      message: `Technician ${status === 1 ? 'activated' : 'deactivated'} successfully`,
      technician: updatedTechnician
    });
  } catch (error) {
    console.error('Error updating technician status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
