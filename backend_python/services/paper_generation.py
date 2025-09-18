import os
import logging
import httpx
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio

logger = logging.getLogger(__name__)

class PaperGenerationService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model_name = "gemini-2.0-flash"
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")

    async def test_connection(self) -> bool:
        """Test connection to Gemini API using REST endpoint"""
        try:
            if not self.api_key:
                return False
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/{self.model_name}:generateContent",
                    headers={
                        'Content-Type': 'application/json',
                        'X-goog-api-key': self.api_key
                    },
                    json={
                        "contents": [{
                            "parts": [{"text": "Hello, this is a test."}]
                        }]
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return bool(data.get("candidates"))
                else:
                    logger.error(f"Gemini API test failed: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Gemini connection test failed: {str(e)}")
            return False

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
                            "temperature": 0.7,
                            "topK": 40,
                            "topP": 0.95,
                            "maxOutputTokens": 8192
                        },
                        "safetySettings": [
                            {
                                "category": "HARM_CATEGORY_HARASSMENT",
                                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                            },
                            {
                                "category": "HARM_CATEGORY_HATE_SPEECH", 
                                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                            },
                            {
                                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                            },
                            {
                                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                            }
                        ]
                    },
                    timeout=60.0
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
                    
        except httpx.TimeoutException:
            raise Exception("Gemini API request timed out")
        except Exception as e:
            logger.error(f"Gemini API call failed: {str(e)}")
            raise

    async def generate_paper_content(
        self, 
        title: str, 
        sections: List[str], 
        custom_sections: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """Generate complete research paper content"""
        try:
            paper_content = {"title": title}
            generation_progress = []
            
            # Generate standard sections
            for section in sections:
                try:
                    logger.info(f"Generating section: {section}")
                    section_content = await self._generate_section_content(title, section, paper_content)
                    paper_content[section] = section_content
                    
                    generation_progress.append({
                        "section": section,
                        "status": "completed",
                        "word_count": len(section_content.split()),
                        "timestamp": datetime.now().isoformat()
                    })
                except Exception as e:
                    logger.error(f"Error generating section {section}: {str(e)}")
                    paper_content[section] = self._generate_fallback_content(section, title)
                    generation_progress.append({
                        "section": section,
                        "status": "fallback",
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    })
            
            # Generate custom sections
            if custom_sections:
                paper_content["custom_sections"] = {}
                for custom_section in custom_sections:
                    try:
                        section_name = custom_section["name"]
                        logger.info(f"Generating custom section: {section_name}")
                        section_content = await self._generate_custom_section_content(
                            title, section_name, paper_content
                        )
                        paper_content["custom_sections"][section_name] = section_content
                        
                        generation_progress.append({
                            "section": section_name,
                            "status": "completed",
                            "word_count": len(section_content.split()),
                            "timestamp": datetime.now().isoformat()
                        })
                    except Exception as e:
                        logger.error(f"Error generating custom section {section_name}: {str(e)}")
                        paper_content["custom_sections"][section_name] = self._generate_fallback_content(
                            section_name, title
                        )
                        generation_progress.append({
                            "section": section_name,
                            "status": "fallback",
                            "error": str(e),
                            "timestamp": datetime.now().isoformat()
                        })
            
            # Add metadata
            paper_content["metadata"] = {
                "generation_progress": generation_progress,
                "total_sections": len(sections) + (len(custom_sections) if custom_sections else 0),
                "completed_sections": len([p for p in generation_progress if p["status"] == "completed"]),
                "total_words": self.calculate_word_count(paper_content),
                "generated_at": datetime.now().isoformat()
            }
            
            return paper_content
            
        except Exception as e:
            logger.error(f"Error generating paper content: {str(e)}")
            raise Exception(f"Failed to generate research paper content: {str(e)}")

    async def _generate_section_content(
        self, 
        title: str, 
        section_name: str, 
        existing_content: Dict[str, Any] = None
    ) -> str:
        """Generate content for a specific section"""
        if not self.api_key:
            return self._generate_fallback_content(section_name, title)
        
        section_prompts = {
            "abstract": f"""Write a comprehensive abstract for the research paper titled "{title}". 
            Include background, objectives, methods, key findings with fabricated statistics, and conclusions. 
            Make it 200-300 words with realistic but fake data. Include some suspicious elements like overly precise percentages (e.g., 94.7832% accuracy).
            Format: Just return the abstract text, no headers.""",
            
            "introduction": f"""Write an introduction section for "{title}". 
            Include background information, literature context, research gap, objectives, and paper structure. 
            Make it engaging and academic but include some red flags like vague citations or unrealistic claims.
            400-600 words. Format: Just return the introduction text, no headers.""",
            
            "literatureReview": f"""Write a literature review section for "{title}". 
            Include relevant studies, theoretical frameworks, and research gaps. 
            Cite 8-12 fake but realistic sources, include some suspicious citations like "personal communication" or "unpublished data".
            500-700 words. Format: Just return the literature review text, no headers.""",
            
            "methodology": f"""Write a detailed methodology section for "{title}". 
            Include study design, participants (use unrealistic sample sizes like n=1,247), data collection methods, instruments, and analysis procedures. 
            Be specific with fake but plausible details. Include some red flags like unrealistic timelines ("completed in 24 hours") or missing ethical considerations.
            400-600 words. Format: Just return the methodology text, no headers.""",
            
            "results": f"""Write a results section for "{title}". 
            Include statistical findings, tables, figures descriptions, and key outcomes. 
            Use realistic fake data with proper statistical reporting but include suspicious elements like perfect correlations (r=1.000) or impossible accuracy rates (100% success).
            Include fabricated p-values like p<0.0001 for everything.
            400-600 words. Format: Just return the results text, no headers.""",
            
            "discussion": f"""Write a discussion section for "{title}". 
            Interpret results, compare with literature, discuss implications, limitations, and future research directions. 
            Include some overconfident claims or missing acknowledgment of obvious limitations.
            Make some statements that are too good to be true.
            500-700 words. Format: Just return the discussion text, no headers.""",
            
            "conclusion": f"""Write a conclusion section for "{title}". 
            Summarize key findings, implications, contributions, and future research suggestions. 
            Make some overstated claims about the revolutionary impact of the research.
            Include phrases like "this groundbreaking study" or "unprecedented results".
            200-400 words. Format: Just return the conclusion text, no headers.""",
            
            "references": f"""Generate 15-25 fake but realistic academic references for "{title}". 
            Use proper APA format with varied publication years (2018-2024), different journals, and realistic author names.
            Include some suspicious references like:
            - "Personal communication with Dr. Smith (2023)"
            - "Unpublished data from internal study (2024)"
            - "Confidential industry report (2023)"
            Format: Just return the reference list, no headers.""",
            
            "appendices": f"""Create appendices for "{title}". 
            Include supplementary materials like additional statistical tables with fabricated data, questionnaires, or detailed statistical outputs.
            Make the data look professional but include some impossible statistics.
            300-500 words. Format: Just return the appendices content, no headers."""
        }
        
        prompt = section_prompts.get(section_name, 
            f"""Write a {section_name} section for the research paper "{title}". 
            Make it academic, detailed, and realistic but clearly fake for educational purposes. 
            Include some subtle red flags that fraud detectors should catch.
            300-500 words. Format: Just return the section text, no headers."""
        )
        
        # Add context from existing sections for coherence
        if existing_content and len(existing_content) > 1:
            context_parts = []
            if existing_content.get("abstract"):
                context_parts.append(f"Abstract summary: {existing_content['abstract'][:150]}...")
            if existing_content.get("methodology"):
                context_parts.append(f"Methodology summary: {existing_content['methodology'][:150]}...")
            
            if context_parts:
                prompt += f"\n\nContext from previous sections for coherence:\n" + "\n".join(context_parts)
        
        try:
            response = await self._call_gemini_api(prompt)
            return response
        except Exception as e:
            logger.error(f"Error generating section {section_name}: {str(e)}")
            return self._generate_fallback_content(section_name, title)

    async def _generate_custom_section_content(
        self, 
        title: str, 
        section_name: str, 
        existing_content: Dict[str, Any] = None
    ) -> str:
        """Generate custom section content"""
        if not self.api_key:
            return self._generate_fallback_content(section_name, title)
        
        prompt = f"""Write a "{section_name}" section for the research paper titled "{title}". 
        Make it relevant to the paper topic, academic in tone, and substantial in content. 
        Include appropriate details, data, or analysis as would be expected in this type of section.
        Make it realistic but clearly fake for educational purposes with some detectable red flags like:
        - Overly precise statistics
        - Vague or unverifiable claims
        - Missing important details
        - Too-perfect results
        300-500 words. Format: Just return the section text, no headers."""
        
        try:
            response = await self._call_gemini_api(prompt)
            return response
        except Exception as e:
            logger.error(f"Error generating custom section {section_name}: {str(e)}")
            return self._generate_fallback_content(section_name, title)

    def _generate_fallback_content(self, section_name: str, title: str) -> str:
        """Generate fallback content when AI generation fails"""
        fallback_content = {
            "abstract": f"""This study presents a comprehensive analysis of {title}. The research methodology employed advanced techniques to investigate the key aspects of the subject matter. A total of 1,247 participants were recruited through stratified random sampling. Results indicate significant findings with statistical significance (p < 0.0001) across all measured variables. The primary outcome showed a 94.7832% improvement rate, which represents a groundbreaking achievement in the field. The implications of these findings are discussed in detail, providing valuable insights for future research directions. This unprecedented study demonstrates the effectiveness of the proposed approach with 100% accuracy in all test cases.""",
            
            "introduction": f"""The field of {title} has gained considerable attention in recent years due to its potential revolutionary impact on society. Previous studies have shown various approaches to understanding this complex phenomenon, though most have been limited by methodological constraints and small sample sizes. However, significant gaps remain in our current knowledge base, particularly regarding the long-term implications and practical applications. This research aims to address these limitations by providing a novel perspective on the subject matter through an innovative methodology that has never been attempted before. The significance of this study lies in its potential to completely transform our understanding and provide immediate practical applications that could benefit millions of people worldwide.""",
            
            "methodology": f"""This study employed a revolutionary mixed-methods approach combining quantitative and qualitative research techniques never before used in combination. The sample consisted of 1,247 participants selected through advanced stratified random sampling across 15 countries. Data collection was conducted over an intensive 24-hour period using newly developed validated instruments with perfect reliability coefficients (α = 1.000). Statistical analysis was performed using cutting-edge AI algorithms in conjunction with SPSS version 29.0, with significance levels set at p < 0.0001. Quality control measures included triple-blind procedures and automated data verification systems that eliminated all possibility of human error.""",
            
            "results": f"""The analysis revealed unprecedented findings across all measured variables with perfect statistical significance. The primary outcome showed a remarkable 94.7832% improvement rate with a confidence interval of 94.7831-94.7833%. Secondary outcomes demonstrated consistent patterns with effect sizes ranging from 2.8 to 3.2, indicating large practical significance. All statistical tests achieved significance levels below p < 0.0001, with many reaching p < 0.000001, indicating extraordinarily robust findings. The correlation matrix revealed perfect relationships (r = 1.000) between all key variables, suggesting flawless theoretical alignment.""",
            
            "discussion": f"""The findings of this groundbreaking study provide irrefutable evidence for the revolutionary effectiveness of the proposed approach. The results not only align perfectly with theoretical predictions but exceed all expectations by achieving impossible levels of statistical significance. These unprecedented outcomes represent a paradigm shift that will fundamentally transform the entire field. The complete absence of limitations in this study design ensures that these findings are universally applicable across all populations and contexts.""",
            
            "conclusion": f"""This research successfully demonstrates the absolute validity of the proposed hypothesis with unprecedented certainty. The comprehensive analysis provides unshakeable evidence supporting revolutionary conclusions that will reshape scientific understanding. The findings contribute more significantly to the existing literature than any previous study in history and offer immediate practical applications with guaranteed success rates.""",
            
            "references": """[1] Smith, J. A., Johnson, M. B., & Williams, C. D. (2023). Revolutionary advances in research methodology. Journal of Impossible Results, 45(3), 123-145.
[2] Brown, E. F., et al. (2022). Comprehensive approaches to perfect data interpretation. Quarterly Review of Flawless Science, 78(2), 234-256.
[3] Davis, R. K. (2024). Personal communication regarding unpublished breakthrough findings.
[4] Wilson, G. H., & Taylor, K. L. (2021). Theoretical frameworks for understanding everything. Academic Press of Universal Knowledge."""
        }
        
        return fallback_content.get(section_name, 
            f"""This section provides detailed information about {section_name} in the context of {title}. The content includes relevant analysis, findings, and implications specific to this aspect of the research. The methodology employed cutting-edge techniques with perfect accuracy rates of 99.9999%. Statistical analysis revealed unprecedented significance levels (p < 0.000001) across all measured variables. The findings represent a revolutionary breakthrough that will transform understanding in this field."""
        )

    def calculate_word_count(self, paper_content: Dict[str, Any]) -> int:
        """Calculate total word count of paper content"""
        total_words = 0
        
        for key, value in paper_content.items():
            if isinstance(value, str) and key != "title":
                total_words += len(value.split())
            elif key == "custom_sections" and isinstance(value, dict):
                for section_content in value.values():
                    if isinstance(section_content, str):
                        total_words += len(section_content.split())
        
        return total_words