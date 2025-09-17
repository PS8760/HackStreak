import { generateResearchPaperContent } from '../services/paperGenerationService.js';
import { verifyPaperAuthenticity } from '../services/paperVerificationService.js';
import { generateResearchPaperPDF } from '../utils/pdfGenerator.js';

// Generate fake research paper with progressive updates
export const generatePaper = async (req, res) => {
  try {
    const { title, sections, customSections } = req.body;

    // Validate input
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Paper title is required'
      });
    }

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one section must be selected'
      });
    }

    console.log(`Starting paper generation for: "${title}"`);
    console.log(`Sections to generate: ${sections.join(', ')}`);

    // Generate paper content using enhanced service
    const paperContent = await generateResearchPaperContent(
      title.trim(),
      sections,
      customSections || []
    );

    res.json({
      success: true,
      message: 'Paper generated successfully',
      data: {
        paperContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          sectionsCount: sections.length,
          customSectionsCount: customSections ? customSections.length : 0,
          totalWords: paperContent.metadata?.totalWords || estimateWordCount(paperContent),
          generationProgress: paperContent.metadata?.generationProgress || [],
          completedSections: paperContent.metadata?.completedSections || sections.length
        }
      }
    });

  } catch (error) {
    console.error('Error generating paper:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate research paper'
    });
  }
};

// Generate individual section (for progressive loading)
export const generateSection = async (req, res) => {
  try {
    const { title, sectionName, existingContent } = req.body;

    if (!title || !sectionName) {
      return res.status(400).json({
        success: false,
        message: 'Title and section name are required'
      });
    }

    console.log(`Generating section: ${sectionName} for paper: "${title}"`);

    const { generateSectionProgressively } = await import('../services/paperGenerationService.js');
    const result = await generateSectionProgressively(title, sectionName, existingContent || {});

    res.json({
      success: result.success,
      message: result.success ? 'Section generated successfully' : 'Section generation failed',
      data: result
    });

  } catch (error) {
    console.error('Error generating section:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate section'
    });
  }
};

// Generate and download PDF with enhanced formatting
export const generatePaperPDF = async (req, res) => {
  try {
    const { paperContent, fileName, options = {} } = req.body;

    if (!paperContent || !paperContent.title) {
      return res.status(400).json({
        success: false,
        message: 'Paper content is required'
      });
    }

    console.log(`Generating PDF for: "${paperContent.title}"`);

    // Generate PDF with enhanced options
    const pdfBuffer = generateResearchPaperPDF(paperContent, fileName, {
      includeMetadata: options.includeMetadata !== false,
      includeWatermark: options.includeWatermark !== false,
      fontSize: options.fontSize || 12,
      lineSpacing: options.lineSpacing || 1.2,
      margins: options.margins || { top: 20, bottom: 20, left: 20, right: 20 }
    });

    // Create safe filename
    const safeTitle = paperContent.title
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, '_')
      .toLowerCase()
      .substring(0, 50);
    
    const downloadFileName = fileName || `${safeTitle}_research_paper.pdf`;
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    res.setHeader('Content-Length', pdfBuffer.byteLength);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    console.log(`PDF generated successfully: ${downloadFileName} (${pdfBuffer.byteLength} bytes)`);

    // Send PDF buffer
    res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate PDF'
    });
  }
};

// Preview paper content before PDF generation
export const previewPaper = async (req, res) => {
  try {
    const { paperContent } = req.body;

    if (!paperContent || !paperContent.title) {
      return res.status(400).json({
        success: false,
        message: 'Paper content is required'
      });
    }

    // Generate preview statistics
    const stats = {
      title: paperContent.title,
      totalSections: Object.keys(paperContent).filter(key => 
        key !== 'title' && key !== 'metadata' && key !== 'customSections'
      ).length,
      customSections: paperContent.customSections ? Object.keys(paperContent.customSections).length : 0,
      totalWords: estimateWordCount(paperContent),
      estimatedPages: Math.ceil(estimateWordCount(paperContent) / 250), // ~250 words per page
      sections: {}
    };

    // Calculate word count per section
    Object.entries(paperContent).forEach(([key, value]) => {
      if (typeof value === 'string' && key !== 'title') {
        stats.sections[key] = {
          wordCount: value.split(/\s+/).filter(w => w.length > 0).length,
          preview: value.substring(0, 150) + (value.length > 150 ? '...' : '')
        };
      }
    });

    if (paperContent.customSections) {
      Object.entries(paperContent.customSections).forEach(([key, value]) => {
        if (typeof value === 'string') {
          stats.sections[`custom_${key}`] = {
            wordCount: value.split(/\s+/).filter(w => w.length > 0).length,
            preview: value.substring(0, 150) + (value.length > 150 ? '...' : '')
          };
        }
      });
    }

    res.json({
      success: true,
      message: 'Paper preview generated',
      data: {
        preview: stats,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate preview'
    });
  }
};

// Verify paper authenticity
export const verifyPaper = async (req, res) => {
  try {
    const { text, fileName } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Paper text is required for verification'
      });
    }

    // Verify paper authenticity
    const verificationResult = await verifyPaperAuthenticity(text.trim());

    res.json({
      success: true,
      message: 'Paper verification completed',
      data: {
        verificationResult,
        metadata: {
          verifiedAt: new Date().toISOString(),
          fileName: fileName || 'Unknown',
          textLength: text.length,
          wordCount: text.split(/\s+/).filter(w => w.length > 0).length
        }
      }
    });

  } catch (error) {
    console.error('Error verifying paper:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify paper authenticity'
    });
  }
};

// Verify PDF file upload
export const verifyPDFFile = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const { processPDFForVerification, validatePDFFile } = await import('../utils/pdfProcessor.js');
    
    // Validate PDF file
    const validation = validatePDFFile(req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PDF file',
        errors: validation.errors
      });
    }

    // Process PDF and extract text
    const pdfResult = await processPDFForVerification(req.file.buffer, req.file.originalname);
    
    if (!pdfResult.success) {
      return res.status(400).json({
        success: false,
        message: pdfResult.error
      });
    }

    // Verify the extracted text
    const verificationResult = await verifyPaperAuthenticity(pdfResult.extractedText);

    res.json({
      success: true,
      message: 'PDF verification completed',
      data: {
        verificationResult,
        pdfMetadata: pdfResult.metadata,
        extractedText: pdfResult.extractedText.substring(0, 1000) + '...', // Preview only
        metadata: {
          verifiedAt: new Date().toISOString(),
          fileName: req.file.originalname,
          fileSize: req.file.size,
          processingMethod: 'pdf_upload'
        }
      }
    });

  } catch (error) {
    console.error('Error verifying PDF file:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify PDF file'
    });
  }
};

// Health check endpoint
export const healthCheck = (req, res) => {
  res.json({
    success: true,
    message: 'PaperFlow Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      textVerification: true,
      pdfVerification: true,
      aiAnalysis: !!process.env.GEMINI_API_KEY,
      pdfGeneration: true
    }
  });
};

// Helper function to estimate word count
const estimateWordCount = (paperContent) => {
  let totalWords = 0;
  
  Object.values(paperContent).forEach(content => {
    if (typeof content === 'string') {
      totalWords += content.split(/\s+/).filter(w => w.length > 0).length;
    } else if (typeof content === 'object' && content !== null) {
      // Handle custom sections object
      Object.values(content).forEach(sectionContent => {
        if (typeof sectionContent === 'string') {
          totalWords += sectionContent.split(/\s+/).filter(w => w.length > 0).length;
        }
      });
    }
  });
  
  return totalWords;
};