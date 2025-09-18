from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import logging
from datetime import datetime
import io

# Import our services
from services.paper_generation import PaperGenerationService
from services.paper_verification import PaperVerificationService
from services.pdf_generator import PDFGeneratorService
from services.pdf_processor import PDFProcessorService
from middleware.rate_limiter import RateLimiter
from models.schemas import (
    PaperGenerationRequest,
    PaperGenerationResponse,
    PaperVerificationRequest,
    PaperVerificationResponse,
    HealthResponse
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PaperFlow Backend API",
    description="Backend API for generating and verifying fake research papers",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "http://localhost:5173")
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize services
paper_generation_service = PaperGenerationService()
paper_verification_service = PaperVerificationService()
pdf_generator_service = PDFGeneratorService()
pdf_processor_service = PDFProcessorService()
rate_limiter = RateLimiter()

# Middleware for request logging
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = datetime.now()
    logger.info(f"{request.method} {request.url.path} - Started")
    
    response = await call_next(request)
    
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(f"{request.method} {request.url.path} - Completed in {process_time:.2f}s")
    
    return response

# Root endpoint
@app.get("/")
async def root():
    return {
        "success": True,
        "message": "PaperFlow Backend API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/papers/health",
            "generate_paper": "POST /api/papers/generate",
            "generate_pdf": "POST /api/papers/generate-pdf",
            "verify_paper": "POST /api/papers/verify",
            "verify_pdf": "POST /api/papers/verify-pdf"
        },
        "documentation": "/docs"
    }

# Health check endpoint
@app.get("/api/papers/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint to verify API status"""
    try:
        # Test Gemini connection
        gemini_status = await paper_generation_service.test_connection()
        
        return HealthResponse(
            success=True,
            message="PaperFlow Backend API is running",
            timestamp=datetime.now().isoformat(),
            version="1.0.0",
            features={
                "text_verification": True,
                "pdf_verification": True,
                "ai_analysis": gemini_status,
                "pdf_generation": True
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Health check failed")

# Generate fake research paper
@app.post("/api/papers/generate", response_model=PaperGenerationResponse)
async def generate_paper(
    request: PaperGenerationRequest,
    _: None = Depends(rate_limiter.check_rate_limit)
):
    """Generate a fake research paper with specified sections"""
    try:
        logger.info(f"Generating paper: {request.title}")
        
        # Generate paper content
        paper_content = await paper_generation_service.generate_paper_content(
            title=request.title,
            sections=request.sections,
            custom_sections=request.custom_sections or []
        )
        
        return PaperGenerationResponse(
            success=True,
            message="Paper generated successfully",
            data={
                "paper_content": paper_content,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "sections_count": len(request.sections),
                    "custom_sections_count": len(request.custom_sections or []),
                    "total_words": paper_generation_service.calculate_word_count(paper_content)
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating paper: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Generate PDF
@app.post("/api/papers/generate-pdf")
async def generate_paper_pdf(request: Dict[str, Any]):
    """Generate and download PDF from paper content"""
    try:
        paper_content = request.get("paper_content")
        file_name = request.get("file_name", "research_paper.pdf")
        
        if not paper_content or not paper_content.get("title"):
            raise HTTPException(status_code=400, detail="Paper content is required")
        
        logger.info(f"Generating PDF for: {paper_content['title']}")
        
        # Generate PDF
        pdf_buffer = pdf_generator_service.generate_pdf(paper_content, file_name)
        
        # Create safe filename
        safe_title = "".join(c for c in paper_content["title"] if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_filename = f"{safe_title[:50]}_research_paper.pdf"
        
        # Return PDF as streaming response
        return StreamingResponse(
            io.BytesIO(pdf_buffer),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={safe_filename}",
                "Content-Length": str(len(pdf_buffer))
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Verify paper authenticity (text input)
@app.post("/api/papers/verify", response_model=PaperVerificationResponse)
async def verify_paper(
    request: PaperVerificationRequest,
    _: None = Depends(rate_limiter.check_rate_limit)
):
    """Verify paper authenticity from text input"""
    try:
        logger.info(f"Verifying paper text ({len(request.text)} characters)")
        
        # Verify paper authenticity
        verification_result = await paper_verification_service.verify_authenticity(
            text=request.text,
            file_name=request.file_name
        )
        
        return PaperVerificationResponse(
            success=True,
            message="Paper verification completed",
            data={
                "verification_result": verification_result,
                "metadata": {
                    "verified_at": datetime.now().isoformat(),
                    "file_name": request.file_name or "Manual Input",
                    "text_length": len(request.text),
                    "word_count": len(request.text.split())
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error verifying paper: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Verify paper authenticity (PDF upload)
@app.post("/api/papers/verify-pdf")
async def verify_paper_pdf(
    pdf_file: UploadFile = File(...),
    _: None = Depends(rate_limiter.check_rate_limit)
):
    """Verify paper authenticity from PDF upload"""
    try:
        # Validate file
        if pdf_file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        if pdf_file.size > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="File size must be less than 10MB")
        
        logger.info(f"Processing PDF: {pdf_file.filename}")
        
        # Read file content
        pdf_content = await pdf_file.read()
        
        # Extract text from PDF
        extracted_text = await pdf_processor_service.extract_text_from_pdf(pdf_content)
        
        if len(extracted_text.strip()) < 100:
            raise HTTPException(status_code=400, detail="PDF contains insufficient text for analysis")
        
        # Verify the extracted text
        verification_result = await paper_verification_service.verify_authenticity(
            text=extracted_text,
            file_name=pdf_file.filename
        )
        
        return {
            "success": True,
            "message": "PDF verification completed",
            "data": {
                "verification_result": verification_result,
                "pdf_metadata": {
                    "file_name": pdf_file.filename,
                    "file_size": pdf_file.size,
                    "text_length": len(extracted_text),
                    "word_count": len(extracted_text.split())
                },
                "extracted_text_preview": extracted_text[:1000] + "..." if len(extracted_text) > 1000 else extracted_text,
                "metadata": {
                    "verified_at": datetime.now().isoformat(),
                    "processing_method": "pdf_upload"
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Error verifying PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "success": False,
        "message": exc.detail,
        "status_code": exc.status_code
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return {
        "success": False,
        "message": "Internal server error",
        "status_code": 500
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )