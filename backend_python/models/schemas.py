from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

class CustomSection(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class PaperGenerationRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    sections: List[str] = Field(..., min_items=1, max_items=15)
    custom_sections: Optional[List[CustomSection]] = Field(None, max_items=10)

class PaperGenerationResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]

class PaperVerificationRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=50000)
    file_name: Optional[str] = Field(None, max_length=255)

class PaperVerificationResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]

class HealthResponse(BaseModel):
    success: bool
    message: str
    timestamp: str
    version: str
    features: Dict[str, bool]

class VerificationResult(BaseModel):
    fake_probability: int = Field(..., ge=0, le=100)
    is_likely_fake: bool
    confidence: str = Field(..., pattern="^(High|Medium|Low)$")
    detected_issues: List[Dict[str, Any]]
    suspicious_content: List[Dict[str, Any]]
    structure_analysis: Dict[str, Any]
    authenticity_check: Dict[str, Any]
    recommendations: List[str]
    analysis_method: str
    timestamp: str

class DetectedIssue(BaseModel):
    type: str
    description: str
    severity: str = Field(..., pattern="^(high|medium|low)$")
    category: str
    count: int
    examples: List[str]

class SuspiciousContent(BaseModel):
    sentence_index: int
    content: str
    issue: str
    severity: str

class StructureAnalysis(BaseModel):
    found_sections: Dict[str, bool]
    total_sections: int
    word_count: int
    sentence_count: int
    has_proper_structure: bool
    missing_elements: List[str]

class AuthenticityCheck(BaseModel):
    authenticity_score: Dict[str, int]
    total_authenticity_points: int
    indicators: List[str]