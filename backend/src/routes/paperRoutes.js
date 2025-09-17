import express from 'express';
import { 
  generatePaper, 
  generateSection, 
  generatePaperPDF, 
  previewPaper,
  verifyPaper, 
  verifyPDFFile, 
  healthCheck 
} from '../controllers/paperController.js';
import { rateLimiter, pdfRateLimiter, geminiRateLimiter } from '../middleware/rateLimiter.js';
import { validatePaperGeneration, validatePaperVerification } from '../middleware/validation.js';
import { uploadPDF, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Health check
router.get('/health', healthCheck);

// Paper Generation Routes
router.post('/generate', 
  rateLimiter,
  geminiRateLimiter,
  validatePaperGeneration,
  generatePaper
);

// Generate individual section (for progressive loading)
router.post('/generate-section',
  rateLimiter,
  geminiRateLimiter,
  generateSection
);

// Preview paper content
router.post('/preview',
  rateLimiter,
  previewPaper
);

// Generate and download PDF
router.post('/generate-pdf', 
  pdfRateLimiter,
  generatePaperPDF
);

// Paper Verification Routes
router.post('/verify', 
  rateLimiter,
  validatePaperVerification,
  verifyPaper
);

// Verify paper authenticity (PDF upload)
router.post('/verify-pdf',
  rateLimiter,
  uploadPDF,
  handleUploadError,
  verifyPDFFile
);

export default router;