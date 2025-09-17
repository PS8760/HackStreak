// Validation middleware for paper generation
export const validatePaperGeneration = (req, res, next) => {
  const { title, sections, customSections } = req.body;
  const errors = [];

  // Validate title
  if (!title || typeof title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (title.trim().length < 5) {
    errors.push('Title must be at least 5 characters long');
  } else if (title.trim().length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Validate sections
  if (!sections || !Array.isArray(sections)) {
    errors.push('Sections must be an array');
  } else if (sections.length === 0) {
    errors.push('At least one section must be selected');
  } else if (sections.length > 15) {
    errors.push('Maximum 15 sections allowed');
  } else {
    // Validate section names
    const validSections = [
      'abstract', 'introduction', 'literatureReview', 'methodology', 
      'results', 'discussion', 'conclusion', 'references', 'appendices'
    ];
    
    const invalidSections = sections.filter(section => 
      typeof section !== 'string' || !validSections.includes(section)
    );
    
    if (invalidSections.length > 0) {
      errors.push(`Invalid sections: ${invalidSections.join(', ')}`);
    }
  }

  // Validate custom sections
  if (customSections && Array.isArray(customSections)) {
    if (customSections.length > 10) {
      errors.push('Maximum 10 custom sections allowed');
    }
    
    customSections.forEach((customSection, index) => {
      if (!customSection || typeof customSection !== 'object') {
        errors.push(`Custom section ${index + 1} must be an object`);
      } else {
        if (!customSection.name || typeof customSection.name !== 'string') {
          errors.push(`Custom section ${index + 1} must have a name`);
        } else if (customSection.name.length > 100) {
          errors.push(`Custom section ${index + 1} name must be less than 100 characters`);
        }
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for paper verification
export const validatePaperVerification = (req, res, next) => {
  const { text, fileName } = req.body;
  const errors = [];

  // Validate text
  if (!text || typeof text !== 'string') {
    errors.push('Text is required and must be a string');
  } else if (text.trim().length < 100) {
    errors.push('Text must be at least 100 characters long for meaningful analysis');
  } else if (text.trim().length > 50000) {
    errors.push('Text must be less than 50,000 characters');
  }

  // Validate fileName (optional)
  if (fileName && typeof fileName !== 'string') {
    errors.push('File name must be a string');
  } else if (fileName && fileName.length > 255) {
    errors.push('File name must be less than 255 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validation middleware for PDF generation
export const validatePDFGeneration = (req, res, next) => {
  const { paperContent, fileName } = req.body;
  const errors = [];

  // Validate paper content
  if (!paperContent || typeof paperContent !== 'object') {
    errors.push('Paper content is required and must be an object');
  } else {
    if (!paperContent.title || typeof paperContent.title !== 'string') {
      errors.push('Paper content must have a title');
    }
    
    // Check if at least one section exists
    const hasSections = Object.keys(paperContent).some(key => 
      key !== 'title' && paperContent[key] && typeof paperContent[key] === 'string'
    );
    
    if (!hasSections) {
      errors.push('Paper content must have at least one section');
    }
  }

  // Validate fileName (optional)
  if (fileName && typeof fileName !== 'string') {
    errors.push('File name must be a string');
  } else if (fileName && fileName.length > 255) {
    errors.push('File name must be less than 255 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};