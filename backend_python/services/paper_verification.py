import re
import logging
import httpx
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio

logger = logging.getLogger(__name__)

class PaperVerificationService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model_name = "gemini-2.0-flash"
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")

    async def _call_gemini_api(self, prompt: str) -> str:
        """Call Gemini API using REST endpoint"""
        if not self.api_key:
            raise Exception("Gemini API key not configured")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/{self.model_name}:generateContent",
                    headers={
                        'Content-Type': 'application/json',
                        'X-goog-api-key': self.api_key
                    },
                    json={
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }],
                        "generationConfig": {
                            "temperature": 0.3,
                            "topK": 40,
                            "topP": 0.95,
                            "maxOutputTokens": 4096
                        }
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates and candidates[0].get("content"):
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and parts[0].get("text"):
                            return parts[0]["text"].strip()
                    
                    raise Exception("No valid response from Gemini API")
                else:
                    error_msg = f"Gemini API error: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    raise Exception(error_msg)
                    
        except Exception as e:
            logger.error(f"Gemini API call failed: {str(e)}")
            raise

    async def verify_authenticity(self, text: str, file_name: Optional[str] = None) -> Dict[str, Any]:
        """Verify paper authenticity using multiple analysis methods"""
        try:
            # Perform local analysis
            local_analysis = await self._perform_local_analysis(text)
            
            # Enhance with AI analysis if available
            ai_analysis = None
            if self.api_key:
                try:
                    ai_analysis = await self._perform_ai_analysis(text)
                except Exception as e:
                    logger.warning(f"AI analysis failed, using local analysis only: {str(e)}")
            
            # Combine analyses
            return self._combine_analyses(local_analysis, ai_analysis)
            
        except Exception as e:
            logger.error(f"Error verifying paper authenticity: {str(e)}")
            raise Exception(f"Failed to verify paper authenticity: {str(e)}")

    async def _perform_local_analysis(self, text: str) -> Dict[str, Any]:
        """Perform comprehensive local analysis"""
        fake_patterns = self._detect_fake_content_patterns(text)
        structure_analysis = self._analyze_research_structure(text)
        authenticity_check = self._check_content_authenticity(text)
        language_analysis = self._analyze_language_patterns(text)
        citation_analysis = self._analyze_citation_patterns(text)
        
        # Calculate fake probability
        fake_probability = self._calculate_fake_probability({
            "fake_patterns": fake_patterns,
            "structure_analysis": structure_analysis,
            "authenticity_check": authenticity_check,
            "language_analysis": language_analysis,
            "citation_analysis": citation_analysis
        })
        
        return {
            "fake_probability": round(fake_probability),
            "is_likely_fake": fake_probability > 60,
            "confidence": "High" if fake_probability > 80 else "Medium" if fake_probability > 40 else "Low",
            "detected_issues": fake_patterns["detected_issues"],
            "suspicious_content": fake_patterns["suspicious_content"],
            "structure_analysis": {
                **structure_analysis,
                "missing_elements": self._identify_missing_elements(structure_analysis)
            },
            "authenticity_check": authenticity_check,
            "language_analysis": language_analysis,
            "citation_analysis": citation_analysis,
            "recommendations": self._generate_recommendations(fake_probability, fake_patterns["detected_issues"], language_analysis),
            "analysis_method": "local",
            "timestamp": datetime.now().isoformat()
        }

    async def _perform_ai_analysis(self, text: str) -> Dict[str, Any]:
        """Perform AI-powered analysis using Gemini"""
        prompt = f"""
        As an expert in academic integrity and AI-generated content detection, analyze this research paper text for authenticity and potential AI generation.
        
        Focus on these key areas:
        1. AI-generated content indicators (repetitive patterns, unnatural flow, generic statements)
        2. Academic writing quality and authenticity markers
        3. Citation patterns and reference quality assessment
        4. Methodological soundness and data presentation
        5. Language sophistication and consistency analysis
        6. Structural integrity and academic formatting
        
        Text to analyze (truncated for analysis):
        "{text[:4000]}"
        
        Provide detailed analysis in this JSON format:
        {{
            "ai_generated_probability": number (0-100),
            "academic_quality": "excellent|good|fair|poor",
            "ai_indicators": [
                {{
                    "indicator": "string",
                    "confidence": "high|medium|low", 
                    "description": "string",
                    "severity": "critical|major|minor"
                }}
            ],
            "authenticity": {{
                "score": number (0-10),
                "factors": ["string"],
                "concerns": ["string"]
            }},
            "writing_analysis": {{
                "naturalness": number (0-10),
                "complexity": number (0-10),
                "consistency": number (0-10)
            }},
            "recommendations": ["string"]
        }}
        """
        
        try:
            response_text = await self._call_gemini_api(prompt)
            
            # Extract JSON from response
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                import json
                return json.loads(json_match.group())
            
            raise Exception("Invalid AI response format")
        except Exception as e:
            logger.error(f"AI analysis failed: {str(e)}")
            raise

    def _combine_analyses(self, local_analysis: Dict[str, Any], ai_analysis: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Combine local and AI analyses"""
        if not ai_analysis:
            return {**local_analysis, "analysis_method": "local_only"}
        
        # Weighted combination of probabilities (local 60%, AI 40%)
        combined_probability = round(
            (local_analysis["fake_probability"] * 0.6) + (ai_analysis["ai_generated_probability"] * 0.4)
        )
        
        # Enhanced confidence calculation
        confidence_factors = [
            local_analysis["confidence"],
            "High" if ai_analysis["authenticity"]["score"] > 7 else "Medium" if ai_analysis["authenticity"]["score"] > 4 else "Low"
        ]
        
        final_confidence = "High" if "High" in confidence_factors and "Low" not in confidence_factors else "Medium" if "Medium" in confidence_factors else "Low"
        
        return {
            **local_analysis,
            "fake_probability": combined_probability,
            "is_likely_fake": combined_probability > 60,
            "confidence": final_confidence,
            "ai_analysis": ai_analysis,
            "analysis_method": "combined",
            "enhanced_recommendations": self._generate_combined_recommendations(local_analysis, ai_analysis)
        }

    def _detect_fake_content_patterns(self, text: str) -> Dict[str, Any]:
        """Detect fake content patterns in research papers"""
        fake_patterns = {
            "fabricated_data": {
                "pattern": re.compile(r'(\d+\.\d{4,}%|\d{4,}\.\d+|\d+\.\d{8,})', re.IGNORECASE),
                "description": "Suspiciously precise or unrealistic numerical data",
                "severity": "high",
                "category": "Data Fabrication"
            },
            "impossible_results": {
                "pattern": re.compile(r'(100% accuracy|0% error rate|perfect correlation|100% success rate|zero failures|flawless results)', re.IGNORECASE),
                "description": "Claims of impossible or highly unlikely perfect results",
                "severity": "high",
                "category": "Result Fabrication"
            },
            "vague_citations": {
                "pattern": re.compile(r'(personal communication|unpublished data|internal report|confidential study|private correspondence)', re.IGNORECASE),
                "description": "References to unverifiable or suspicious sources",
                "severity": "medium",
                "category": "Citation Issues"
            },
            "unrealistic_timeline": {
                "pattern": re.compile(r'(conducted.*same day|completed.*24 hours|instant results|immediate analysis|overnight study)', re.IGNORECASE),
                "description": "Unrealistic timeframes for research activities",
                "severity": "medium",
                "category": "Timeline Issues"
            },
            "suspicious_statistics": {
                "pattern": re.compile(r'(p\s*=\s*0\.0000|p\s*<\s*0\.0001.*p\s*<\s*0\.0001|all.*significant|every.*significant)', re.IGNORECASE),
                "description": "Suspicious statistical reporting patterns",
                "severity": "high",
                "category": "Statistical Issues"
            }
        }
        
        detected_issues = []
        suspicious_content = []
        
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 10]
        
        for key, pattern_info in fake_patterns.items():
            matches = pattern_info["pattern"].findall(text)
            if matches:
                detected_issues.append({
                    "type": key,
                    "description": pattern_info["description"],
                    "severity": pattern_info["severity"],
                    "category": pattern_info["category"],
                    "count": len(matches),
                    "examples": [match[:100] if isinstance(match, str) else str(match)[:100] for match in matches[:3]]
                })
                
                # Find sentences containing these patterns
                for i, sentence in enumerate(sentences):
                    if pattern_info["pattern"].search(sentence):
                        suspicious_content.append({
                            "sentence_index": i + 1,
                            "content": sentence[:200],
                            "issue": pattern_info["category"],
                            "severity": pattern_info["severity"]
                        })
        
        return {
            "detected_issues": detected_issues,
            "suspicious_content": suspicious_content[:10]  # Limit to top 10
        }

    def _analyze_research_structure(self, text: str) -> Dict[str, Any]:
        """Analyze research paper structure"""
        sections = {
            "abstract": re.compile(r'abstract[\s\S]{50,500}', re.IGNORECASE),
            "introduction": re.compile(r'introduction[\s\S]{100,1000}', re.IGNORECASE),
            "methodology": re.compile(r'(methodology|methods)[\s\S]{100,1000}', re.IGNORECASE),
            "results": re.compile(r'results[\s\S]{100,1000}', re.IGNORECASE),
            "discussion": re.compile(r'discussion[\s\S]{100,1000}', re.IGNORECASE),
            "conclusion": re.compile(r'conclusion[\s\S]{50,500}', re.IGNORECASE),
            "references": re.compile(r'(references|bibliography)[\s\S]{50,}', re.IGNORECASE)
        }
        
        found_sections = {}
        total_sections = 0
        
        for section, pattern in sections.items():
            matches = pattern.search(text)
            found_sections[section] = bool(matches)
            if found_sections[section]:
                total_sections += 1
        
        words = text.split()
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
        
        return {
            "found_sections": found_sections,
            "total_sections": total_sections,
            "word_count": len(words),
            "sentence_count": len(sentences),
            "has_proper_structure": total_sections >= 4
        }

    def _check_content_authenticity(self, text: str) -> Dict[str, Any]:
        """Check for authenticity indicators"""
        authenticity_checks = {
            "has_specific_dates": re.compile(r'\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b', re.IGNORECASE),
            "has_specific_locations": re.compile(r'\b(university of|institute of|college of|hospital|laboratory|department of)\s+[\w\s]+', re.IGNORECASE),
            "has_real_journals": re.compile(r'\b(nature|science|cell|lancet|nejm|plos|ieee|acm|springer|elsevier)\b', re.IGNORECASE),
            "has_proper_citations": re.compile(r'\[\d+\]|\(\w+\s+et\s+al\.?,?\s+\d{4}\)'),
            "has_contact_info": re.compile(r'(email|correspondence|contact).*@.*\.(edu|org|com)', re.IGNORECASE)
        }
        
        authenticity_score = {}
        total_authenticity_points = 0
        indicators = []
        
        for check, pattern in authenticity_checks.items():
            matches = pattern.findall(text)
            authenticity_score[check] = len(matches)
            total_authenticity_points += len(matches)
            
            if matches:
                indicators.append(f"Found {len(matches)} instances of {check.replace('_', ' ')}")
        
        return {
            "authenticity_score": authenticity_score,
            "total_authenticity_points": total_authenticity_points,
            "indicators": indicators
        }

    def _analyze_language_patterns(self, text: str) -> Dict[str, Any]:
        """Analyze language patterns for AI detection"""
        sentences = [s.strip() for s in re.split(r'[.!?]+', text) if len(s.strip()) > 10]
        words = text.lower().split()
        
        # Calculate metrics
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        unique_words = set(words)
        vocabulary_diversity = len(unique_words) / len(words) if words else 0
        
        # Check for AI patterns
        ai_patterns = {
            "repetitive_starters": self._analyze_repetitive_starters(sentences),
            "transition_overuse": self._analyze_transition_words(text),
            "generic_phrases": self._analyze_generic_phrases(text)
        }
        
        issues = []
        suspicion_score = 0
        
        if avg_sentence_length > 25:
            issues.append("Unusually long average sentence length may indicate AI generation")
            suspicion_score += 15
        
        if vocabulary_diversity < 0.3:
            issues.append("Low vocabulary diversity suggests limited language model")
            suspicion_score += 20
        
        if ai_patterns["repetitive_starters"]["score"] > 0.3:
            issues.append("High repetition in sentence structures")
            suspicion_score += 25
        
        return {
            "avg_sentence_length": round(avg_sentence_length, 1),
            "vocabulary_diversity": round(vocabulary_diversity * 100),
            "suspicion_score": suspicion_score,
            "ai_patterns": ai_patterns,
            "issues": issues,
            "naturalness": max(0, 100 - suspicion_score)
        }

    def _analyze_citation_patterns(self, text: str) -> Dict[str, Any]:
        """Analyze citation patterns for authenticity"""
        citation_formats = {
            "numbered": len(re.findall(r'\[\d+\]', text)),
            "author_year": len(re.findall(r'\(\w+\s*,?\s*\d{4}\)', text)),
            "et_al": len(re.findall(r'\w+\s+et\s+al\.?\s*,?\s*\d{4}', text, re.IGNORECASE)),
            "doi": len(re.findall(r'doi:\s*10\.\d+', text, re.IGNORECASE))
        }
        
        total_citations = sum(citation_formats.values())
        has_reference_section = bool(re.search(r'references|bibliography', text, re.IGNORECASE))
        
        # Analyze citation quality
        suspicious_citations = (
            len(re.findall(r'personal communication', text, re.IGNORECASE)) +
            len(re.findall(r'unpublished data', text, re.IGNORECASE)) +
            len(re.findall(r'internal report', text, re.IGNORECASE))
        )
        
        issues = []
        if total_citations == 0 and len(text) > 2000:
            issues.append("No citations found in substantial text")
        if suspicious_citations > total_citations * 0.3:
            issues.append("High proportion of unverifiable citations")
        if total_citations > 0 and not has_reference_section:
            issues.append("Citations present but no reference section found")
        
        return {
            "total_citations": total_citations,
            "citation_formats": citation_formats,
            "has_reference_section": has_reference_section,
            "suspicious_citations": suspicious_citations,
            "citation_density": round((total_citations / (len(text) / 1000)), 1) if text else 0,
            "issues": issues
        }

    def _analyze_repetitive_starters(self, sentences: List[str]) -> Dict[str, Any]:
        """Analyze repetitive sentence starters"""
        starters = [s[:15].lower() for s in sentences if s]
        unique_starters = set(starters)
        
        return {
            "score": 1 - (len(unique_starters) / len(starters)) if starters else 0,
            "examples": list(unique_starters)[:5]
        }

    def _analyze_transition_words(self, text: str) -> Dict[str, Any]:
        """Analyze transition word usage"""
        transitions = ['however', 'furthermore', 'moreover', 'therefore', 'consequently', 'additionally']
        count = sum(len(re.findall(rf'\b{word}\b', text, re.IGNORECASE)) for word in transitions)
        
        return {
            "count": count,
            "density": count / (len(text) / 1000) if text else 0
        }

    def _analyze_generic_phrases(self, text: str) -> Dict[str, Any]:
        """Analyze generic academic phrases"""
        generic_phrases = [
            'it is important to note',
            'furthermore, it should be noted',
            'in conclusion, it can be said',
            'this study demonstrates that',
            'the results clearly show'
        ]
        
        matches = sum(len(re.findall(phrase, text, re.IGNORECASE)) for phrase in generic_phrases)
        
        return {
            "matches": matches,
            "phrases": generic_phrases[:3]
        }

    def _calculate_fake_probability(self, analyses: Dict[str, Any]) -> float:
        """Calculate overall fake probability"""
        probability = 0
        
        # Base pattern analysis (40% weight)
        for issue in analyses["fake_patterns"]["detected_issues"]:
            multiplier = {"high": 15, "medium": 8, "low": 3}.get(issue["severity"], 5)
            probability += issue["count"] * multiplier
        
        # Structure analysis (20% weight)
        if not analyses["structure_analysis"]["has_proper_structure"]:
            probability += 20
        if analyses["structure_analysis"]["word_count"] < 1000:
            probability += 15
        
        # Language patterns (25% weight)
        probability += analyses["language_analysis"]["suspicion_score"] * 0.8
        
        # Citation analysis (10% weight)
        if len(analyses["citation_analysis"]["issues"]) > 2:
            probability += 15
        if (analyses["citation_analysis"]["total_citations"] == 0 and 
            analyses["structure_analysis"]["word_count"] > 2000):
            probability += 10
        
        # Authenticity bonuses (reduce probability)
        if analyses["authenticity_check"]["total_authenticity_points"] > 8:
            probability -= 20
        if analyses["citation_analysis"]["total_citations"] > 15:
            probability -= 10
        if analyses["language_analysis"]["naturalness"] > 80:
            probability -= 15
        
        return max(5, min(95, probability))

    def _identify_missing_elements(self, structure_analysis: Dict[str, Any]) -> List[str]:
        """Identify missing structural elements"""
        required = ['abstract', 'introduction', 'methodology', 'results', 'conclusion', 'references']
        return [element for element in required if not structure_analysis["found_sections"].get(element, False)]

    def _generate_recommendations(self, probability: float, issues: List[Dict], language_analysis: Dict) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        if probability > 80:
            recommendations.append('🚨 CRITICAL: Very high probability of fabricated content - immediate manual review required')
        elif probability > 60:
            recommendations.append('⚠️ HIGH RISK: Significant concerns detected - thorough verification needed')
        elif probability > 40:
            recommendations.append('⚡ MODERATE RISK: Some suspicious patterns found - additional checks recommended')
        else:
            recommendations.append('✅ LOW RISK: Content appears authentic with normal characteristics')
        
        # Specific issue-based recommendations
        for issue in issues:
            category = issue.get("category", "")
            if category == "Data Fabrication":
                recommendations.append('📊 Verify all statistical data and numerical claims with original sources')
            elif category == "Citation Issues":
                recommendations.append('📚 Cross-check all citations for accuracy and verifiability')
            elif category == "Statistical Issues":
                recommendations.append('📈 Statistical results require expert statistical review')
        
        # Language-based recommendations
        if language_analysis.get("naturalness", 100) < 60:
            recommendations.append('🤖 Language patterns suggest possible AI generation - human review needed')
        
        return recommendations

    def _generate_combined_recommendations(self, local_analysis: Dict, ai_analysis: Dict) -> List[str]:
        """Generate combined recommendations from local and AI analysis"""
        combined = list(local_analysis["recommendations"])
        
        if ai_analysis.get("academic_quality") == "poor":
            combined.append('🎓 AI analysis indicates poor academic quality - content review required')
        
        if ai_analysis.get("ai_generated_probability", 0) > 70:
            combined.append('🤖 AI detection confidence is high - likely machine-generated content')
        
        for rec in ai_analysis.get("recommendations", []):
            if not any(rec[:20] in existing for existing in combined):
                combined.append(f'🔍 AI Insight: {rec}')
        
        return combined