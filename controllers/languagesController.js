const Languages = require('../models/languages');
const createError = require('../utils/createError');
const prisma = require('../prisma/client');

// Get all translations as a key-value object
exports.translations = async (req, res, next) => {
  try {
    const allLanguages = await prisma.languages.findMany();

    // Create an empty object to store the formatted data
    let formattedData = {};

    // Loop through the data and populate the formatted object
    allLanguages.forEach(item => {
      formattedData[item.key] = item.value;
    });

    res.json(formattedData);
  } catch (error) {
    next(error);
  }
};

// Create a new language entry
exports.createLanguage = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    
    // Validate required fields
    if (!key || !value) {
      return next(createError(400, 'Key and value are required'));
    }
    
    // Check if key already exists
    const existingLanguage = await Languages.findByKey(key);
    if (existingLanguage) {
      return next(createError(400, `Language key '${key}' already exists`));
    }
    
    const languageData = {
      key,
      value
    };
    
    const language = await Languages.create(languageData);
    
    res.status(201).json({
      success: true,
      data: language
    });
  } catch (error) {
    next(error);
  }
};

// Get all language entries
exports.getAllLanguages = async (req, res, next) => {
  try {
    const languages = await Languages.findAll();
    
    res.status(200).json({
      success: true,
      count: languages.length,
      data: languages
    });
  } catch (error) {
    next(error);
  }
};

// Get a single language entry by ID
exports.getLanguageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const language = await Languages.findById(id);
    
    if (!language) {
      return next(createError(404, `Language with id ${id} not found`));
    }
    
    res.status(200).json({
      success: true,
      data: language
    });
  } catch (error) {
    next(error);
  }
};

// Get a single language entry by key
exports.getLanguageByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    
    const language = await Languages.findByKey(key);
    
    if (!language) {
      return next(createError(404, `Language with key '${key}' not found`));
    }
    
    res.status(200).json({
      success: true,
      data: language
    });
  } catch (error) {
    next(error);
  }
};

// Update a language entry
exports.updateLanguage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { key, value } = req.body;
    
    // Check if language exists
    const existingLanguage = await Languages.findById(id);
    
    if (!existingLanguage) {
      return next(createError(404, `Language with id ${id} not found`));
    }
    
    // If key is being changed, check if new key already exists
    if (key && key !== existingLanguage.key) {
      const keyExists = await Languages.findByKey(key);
      if (keyExists) {
        return next(createError(400, `Language key '${key}' already exists`));
      }
    }
    
    // Update language data
    const updatedLanguage = await Languages.update(id, {
      key: key || existingLanguage.key,
      value: value || existingLanguage.value
    });
    
    res.status(200).json({
      success: true,
      data: updatedLanguage
    });
  } catch (error) {
    next(error);
  }
};

// Delete a language entry
exports.deleteLanguage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if language exists
    const language = await Languages.findById(id);
    
    if (!language) {
      return next(createError(404, `Language with id ${id} not found`));
    }
    
    await Languages.delete(id);
    
    res.status(200).json({
      success: true,
      message: 'Language entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
