import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyD2IOD95V-uZ7t13g19KUTjlcqZS1hXWno";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Get the generative model
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

// Generate fake research paper content
export const generateResearchPaperContent = async (title, sections, customSections = []) => {
  const model = getGeminiModel();
  
  try {
    // Create a comprehensive prompt for generating fake research paper
    const prompt = `
You are an AI assistant helping to create FAKE research papers for educational purposes to train people to identify fraudulent academic content.

Task: Generate a complete fake research paper with the following specifications:

Title: "${title}"
Required Sections: ${sections.join(', ')}
${customSections.length > 0 ? `Custom Sections: ${customSections.map(s => s.name).join(', ')}` : ''}

CRITICAL REQUIREMENTS:
1. This is FAKE content for educational fraud detection training
2. Make it look professionally written but include subtle red flags
3. Each section should be 200-400 words
4. Include fabricated but realistic-sounding data and statistics
5. Add some suspicious elements that fraud detectors should catch:
   - Overly precise statistics (like 94.7832% accuracy)
   - Vague citations ("personal communication", "unpublished data")
   - Perfect or impossible results (100% success rates)
   - Unrealistic timelines ("completed in 24 hours")
   - Missing ethical considerations for human studies

RESPONSE FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "title": "${title}",
  "abstract": "Write a 150-200 word abstract with fabricated findings...",
  "introduction": "Write introduction section...",
  "methodology": "Write methodology with some suspicious elements...",
  "results": "Write results with fabricated data and overly precise statistics...",
  "discussion": "Write discussion interpreting the fake results...",
  "conclusion": "Write conclusion summarizing fake findings...",
  "references": "List 8-10 fake but realistic-looking academic references...",
  ${customSections.length > 0 ? `"customSections": {${customSections.map(s => `"${s.name}": "Content for ${s.name} section..."`).join(', ')}}` : '"customSections": {}'}
}

Generate realistic academic content but ensure it contains detectable fabrication indicators for training purposes.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text
    let cleanedText = text.trim();
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
    
    // Try to parse JSON response
    try {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedContent = JSON.parse(jsonMatch[0]);
        
        // Ensure all required sections are present
        const requiredFields = ['title', 'abstract', 'introduction', 'methodology', 'results', 'discussion', 'conclusion', 'references'];
        const missingFields = requiredFields.filter(field => !parsedContent[field]);
        
        if (missingFields.length > 0) {
          console.warn('Missing fields in generated content:', missingFields);
          // Fill missing fields with fallback content
          missingFields.forEach(field => {
            parsedContent[field] = generateFallbackContent(field, title);
          });
        }
        
        return parsedContent;
      }
    } catch (parseError) {
      console.warn('Could not parse JSON response, using fallback structure');
    }
    
    // Fallback: create structured content from plain text
    return parseTextToStructure(text, title, sections, customSections);
    
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error('Failed to generate research paper content. Please try again.');
  }
};

// Fallback function to structure plain text response
const parseTextToStructure = (text, title, sections, customSections) => {
  const structure = { title };
  
  // Split text into sections based on common academic section headers
  const sectionPatterns = {
    abstract: /abstract[\s\S]*?(?=introduction|methodology|methods|results|discussion|conclusion|references|$)/i,
    introduction: /introduction[\s\S]*?(?=methodology|methods|literature|results|discussion|conclusion|references|$)/i,
    methodology: /(methodology|methods)[\s\S]*?(?=results|discussion|conclusion|references|$)/i,
    results: /results[\s\S]*?(?=discussion|conclusion|references|$)/i,
    discussion: /discussion[\s\S]*?(?=conclusion|references|$)/i,
    conclusion: /conclusion[\s\S]*?(?=references|$)/i,
    references: /references[\s\S]*$/i
  };
  
  sections.forEach(section => {
    const pattern = sectionPatterns[section];
    if (pattern) {
      const match = text.match(pattern);
      structure[section] = match ? match[0].trim() : generateFallbackContent(section, title);
    } else {
      structure[section] = generateFallbackContent(section, title);
    }
  });
  
  // Handle custom sections
  if (customSections.length > 0) {
    structure.customSections = {};
    customSections.forEach(customSection => {
      structure.customSections[customSection.name] = generateFallbackContent(customSection.name, title);
    });
  }
  
  return structure;
};

// Generate fallback content for sections
const generateFallbackContent = (sectionName, title) => {
  const fallbackContent = {
    abstract: `This study presents a comprehensive analysis of ${title}. The research methodology employed advanced techniques to investigate the key aspects of the subject matter. Results indicate significant findings with statistical significance (p < 0.001). The implications of these findings are discussed in detail, providing valuable insights for future research directions.`,
    
    introduction: `The field of ${title} has gained considerable attention in recent years. Previous studies have shown various approaches to understanding this complex phenomenon. However, gaps remain in our current knowledge base. This research aims to address these limitations by providing a novel perspective on the subject matter. The significance of this study lies in its potential to advance our understanding and provide practical applications.`,
    
    methodology: `This study employed a mixed-methods approach combining quantitative and qualitative research techniques. The sample consisted of 1,247 participants selected through stratified random sampling. Data collection was conducted over a 12-month period using validated instruments. Statistical analysis was performed using SPSS version 28.0, with significance levels set at p < 0.05. Ethical approval was obtained from the institutional review board.`,
    
    results: `The analysis revealed significant findings across all measured variables. The primary outcome showed a 94.7% improvement rate with a confidence interval of 92.1-97.3%. Secondary outcomes demonstrated consistent patterns with effect sizes ranging from 0.8 to 1.2. All statistical tests achieved significance levels below p < 0.001, indicating robust findings. The data distribution followed normal patterns with minimal outliers detected.`,
    
    discussion: `The findings of this study provide compelling evidence for the effectiveness of the proposed approach. The results align with theoretical predictions while offering new insights into the underlying mechanisms. Limitations include the specific population studied and potential confounding variables. Future research should explore longitudinal effects and cross-cultural validation. The practical implications suggest immediate applications in relevant fields.`,
    
    conclusion: `This research successfully demonstrates the validity of the proposed hypothesis. The comprehensive analysis provides strong evidence supporting the main conclusions. The findings contribute significantly to the existing literature and offer practical applications. Future research directions include expanding the scope and exploring related phenomena. The study's limitations are acknowledged and provide opportunities for further investigation.`,
    
    references: `[1] Smith, J. A., & Johnson, M. B. (2023). Advanced methodologies in research analysis. Journal of Academic Studies, 45(3), 123-145.\n[2] Brown, C. D., et al. (2022). Comprehensive approaches to data interpretation. Research Quarterly, 78(2), 234-256.\n[3] Davis, E. F. (2023). Statistical significance in modern research. Academic Press.\n[4] Wilson, G. H., & Taylor, K. L. (2022). Methodological considerations for contemporary studies. Science Today, 12(4), 67-89.`
  };
  
  return fallbackContent[sectionName] || `This section provides detailed information about ${sectionName} in the context of ${title}. The content includes relevant analysis, findings, and implications specific to this aspect of the research. Further details and supporting evidence are presented to substantiate the claims made in this section.`;
};

export default { generateResearchPaperContent, getGeminiModel };