const prisma = require('../prisma/client');

// Controller methods for FAQ CRUD operations
exports.createFAQ = async (req, res) => {
  try {
    const { name, name_ar, content, content_ar } = req.body;
    
    // Validate required fields
    if (!name || !content) {
      return res.status(400).json({ 
        error: 'Required fields missing: name and content are required' 
      });
    }
    
    // Create new FAQ
    const faq = await prisma.faq.create({
      data: {
        name,
        name_ar: name_ar || null,
        content,
        content_ar: content_ar || null
      }
    });
    
    res.status(201).json({ 
      message: 'FAQ created successfully',
      faq
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    
    // Handle unique constraint violations if any
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'FAQ with this name already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllFAQs = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    
    // Build filter object
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { name_ar: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { content_ar: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get FAQs with pagination, sort by createdAt descending (newest first)
    const faqs = await prisma.faq.findMany({
      where,
      skip: skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    // Get total count
    const totalItems = await prisma.faq.count({ where });
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
      faqs
    });
  } catch (error) {
    console.error('Error retrieving FAQs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getFAQById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find FAQ by ID
    const faq = await prisma.faq.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    res.status(200).json(faq);
  } catch (error) {
    console.error('Error retrieving FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, name_ar, content, content_ar } = req.body;
    
    // Check if FAQ exists
    const existingFAQ = await prisma.faq.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingFAQ) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    // Update FAQ
    const updatedFAQ = await prisma.faq.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : existingFAQ.name,
        name_ar: name_ar !== undefined ? name_ar : existingFAQ.name_ar,
        content: content !== undefined ? content : existingFAQ.content,
        content_ar: content_ar !== undefined ? content_ar : existingFAQ.content_ar
      }
    });
    
    res.status(200).json({
      message: 'FAQ updated successfully',
      faq: updatedFAQ
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    
    // Handle unique constraint violations if any
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'FAQ with this name already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if FAQ exists
    const existingFAQ = await prisma.faq.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingFAQ) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    // Delete FAQ
    await prisma.faq.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(200).json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get FAQ statistics
exports.getFAQStats = async (req, res) => {
  try {
    // Get total FAQ count
    const totalFAQs = await prisma.faq.count();
    
    // Get FAQs with Arabic content count
    const faqsWithArabic = await prisma.faq.count({
      where: {
        OR: [
          { name_ar: { not: null } },
          { content_ar: { not: null } }
        ]
      }
    });
    
    res.status(200).json({
      totalFAQs,
      faqsWithArabic,
      faqsWithoutArabic: totalFAQs - faqsWithArabic
    });
  } catch (error) {
    console.error('Error getting FAQ stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
