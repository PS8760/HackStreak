import PyPDF2
import logging
from io import BytesIO
from typing import Optional
import re

logger = logging.getLogger(__name__)

class PDFProcessorService:
    def __init__(self):
        pass

    async def extract_text_from_pdf(self, pdf_content: bytes) -> str:
        """Extract text from PDF content"""
        try:
            logger.info("Extracting text from PDF")
            
            # Create BytesIO object from PDF content
            pdf_stream = BytesIO(pdf_content)
            
            # Create PDF reader
            pdf_reader = PyPDF2.PdfReader(pdf_stream)
            
            # Check if PDF is encrypted
            if pdf_reader.is_encrypted:
                raise Exception("PDF is password protected and cannot be processed")
            
            # Extract text from all pages
            full_text = ""
            for page_num in range(len(pdf_reader.pages)):
                try:
                    page = pdf_reader.pages[page_num]
                    page_text = page.extract_text()
                    full_text += page_text + "\n"
                except Exception as e:
                    logger.warning(f"Error extracting text from page {page_num + 1}: {str(e)}")
                    continue
            
            # Clean the extracted text
            cleaned_text = self._clean_extracted_text(full_text)
            
            if len(cleaned_text.strip()) < 50:
                raise Exception("PDF contains insufficient readable text")
            
            logger.info(f"Successfully extracted {len(cleaned_text)} characters from PDF")
            return cleaned_text
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise Exception(f"Failed to extract text from PDF: {str(e)}")

    def _clean_extracted_text(self, text: str) -> str:
        """Clean extracted text for analysis"""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove page numbers and headers/footers patterns
        text = re.sub(r'page\s+\d+', '', text, flags=re.IGNORECASE)
        text = re.sub(r'^\d+\s*$', '', text, flags=re.MULTILINE)
        
        # Remove common PDF artifacts
        text = text.replace('\f', ' ')  # Form feed characters
        text = re.sub(r'[\x00-\x1F\x7F]', '', text)  # Control characters
        
        # Normalize line breaks
        text = text.replace('\r\n', '\n')
        text = text.replace('\r', '\n')
        
        # Clean up multiple newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove leading/trailing whitespace
        text = text.strip()
        
        return text

    def validate_pdf_file(self, file_size: int, content_type: str, filename: str) -> dict:
        """Validate PDF file before processing"""
        errors = []
        
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            errors.append('PDF file size must be less than 10MB')
        
        # Check content type
        if content_type != 'application/pdf':
            errors.append('Only PDF files are allowed')
        
        # Check file extension
        if not filename.lower().endswith('.pdf'):
            errors.append('File must have .pdf extension')
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors
        }

    def extract_pdf_metadata(self, pdf_content: bytes) -> Optional[dict]:
        """Extract metadata from PDF"""
        try:
            pdf_stream = BytesIO(pdf_content)
            pdf_reader = PyPDF2.PdfReader(pdf_stream)
            
            metadata = pdf_reader.metadata
            
            if metadata:
                return {
                    'title': metadata.get('/Title', 'Unknown'),
                    'author': metadata.get('/Author', 'Unknown'),
                    'subject': metadata.get('/Subject', 'Unknown'),
                    'creator': metadata.get('/Creator', 'Unknown'),
                    'producer': metadata.get('/Producer', 'Unknown'),
                    'creation_date': str(metadata.get('/CreationDate', 'Unknown')),
                    'modification_date': str(metadata.get('/ModDate', 'Unknown')),
                    'page_count': len(pdf_reader.pages),
                    'file_size': len(pdf_content)
                }
            else:
                return {
                    'title': 'No metadata available',
                    'author': 'Unknown',
                    'subject': 'Unknown',
                    'creator': 'Unknown',
                    'producer': 'Unknown',
                    'creation_date': 'Unknown',
                    'modification_date': 'Unknown',
                    'page_count': len(pdf_reader.pages),
                    'file_size': len(pdf_content)
                }
                
        except Exception as e:
            logger.error(f"Error extracting PDF metadata: {str(e)}")
            return None

    def is_pdf_password_protected(self, pdf_content: bytes) -> bool:
        """Check if PDF is password protected"""
        try:
            pdf_stream = BytesIO(pdf_content)
            pdf_reader = PyPDF2.PdfReader(pdf_stream)
            return pdf_reader.is_encrypted
        except Exception:
            return False

    def estimate_pdf_complexity(self, pdf_content: bytes) -> str:
        """Estimate PDF complexity for processing time"""
        try:
            size_in_mb = len(pdf_content) / (1024 * 1024)
            
            if size_in_mb < 1:
                return 'low'
            elif size_in_mb < 5:
                return 'medium'
            else:
                return 'high'
                
        except Exception:
            return 'unknown'