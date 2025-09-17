import { getGeminiModel } from '../config/gemini.js';

// Generate complete research paper content
export const generateResearchPaperContent = async (title, sections, customSections = []) => {
  try {
    const paperContent = { title };
    const generationProgress = [];

    // Generate sections progressively for better user experience
    for (const section of sections) {
      try {
        console.log(`Generating section: ${section}`);
        const sectionContent = await generateSectionContent(title, section, paperContent);
        paperContent[section] = sectionContent;
        generationProgress.push({
          section,
          status: 'completed',
          wordCount: sectionContent.split(' ').length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Error generating section ${section}:`, error);
        paperContent[section] = generateFallbackContent(section, title);
        generationProgress.push({
          section,
          status: 'fallback',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Generate custom sections
    if (customSections && customSections.length > 0) {
      paperContent.customSections = {};
      for (const customSection of customSections) {
        try {
          console.log(`Generating custom section: ${customSection.name}`);
          const sectionContent = await generateCustomSectionContent(title, customSection.name, paperContent);
          paperContent.customSections[customSection.name] = sectionContent;
          generationProgress.push({
            section: customSection.name,
            status: 'completed',
            wordCount: sectionContent.split(' ').length,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error generating custom section ${customSection.name}:`, error);
          paperContent.customSections[customSection.name] = generateFallbackContent(customSection.name, title);
          generationProgress.push({
            section: customSection.name,
            status: 'fallback',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    return {
      ...paperContent,
      metadata: {
        generationProgress,
        totalSections: sections.length + (customSections?.length || 0),
        completedSections: generationProgress.filter(p => p.status === 'completed').length,
        totalWords: calculateTotalWords(paperContent),
        generatedAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('Error generating paper content:', error);
    throw new Error('Failed to generate research paper content. Please try again.');
  }
};

// Generate individual section content with enhanced prompts
const generateSectionContent = async (title, sectionName, existingContent = {}) => {
  const model = getGeminiModel();

  const sectionPrompts = {
    abstract: `Write a comprehensive abstract for the research paper titled "${title}". 
    Include background, objectives, methods, key findings with fabricated statistics, and conclusions. 
    Make it 200-300 words with realistic but fake data. Include some suspicious elements like overly precise percentages (e.g., 94.7832% accuracy).
    Format: Just return the abstract text, no headers.`,
    
    introduction: `Write an introduction section for "${title}". 
    Include background information, literature context, research gap, objectives, and paper structure. 
    Make it engaging and academic but include some red flags like vague citations or unrealistic claims.
    400-600 words. Format: Just return the introduction text, no headers.`,
    
    literatureReview: `Write a literature review section for "${title}". 
    Include relevant studies, theoretical frameworks, and research gaps. 
    Cite 8-12 fake but realistic sources, include some suspicious citations like "personal communication" or "unpublished data".
    500-700 words. Format: Just return the literature review text, no headers.`,
    
    methodology: `Write a detailed methodology section for "${title}". 
    Include study design, participants (use unrealistic sample sizes like n=1,247), data collection methods, instruments, and analysis procedures. 
    Be specific with fake but plausible details. Include some red flags like unrealistic timelines ("completed in 24 hours") or missing ethical considerations.
    400-600 words. Format: Just return the methodology text, no headers.`,
    
    results: `Write a results section for "${title}". 
    Include statistical findings, tables, figures descriptions, and key outcomes. 
    Use realistic fake data with proper statistical reporting but include suspicious elements like perfect correlations (r=1.000) or impossible accuracy rates (100% success).
    Include fabricated p-values like p<0.0001 for everything.
    400-600 words. Format: Just return the results text, no headers.`,
    
    discussion: `Write a discussion section for "${title}". 
    Interpret results, compare with literature, discuss implications, limitations, and future research directions. 
    Include some overconfident claims or missing acknowledgment of obvious limitations.
    Make some statements that are too good to be true.
    500-700 words. Format: Just return the discussion text, no headers.`,
    
    conclusion: `Write a conclusion section for "${title}". 
    Summarize key findings, implications, contributions, and future research suggestions. 
    Make some overstated claims about the revolutionary impact of the research.
    Include phrases like "this groundbreaking study" or "unprecedented results".
    200-400 words. Format: Just return the conclusion text, no headers.`,
    
    references: `Generate 15-25 fake but realistic academic references for "${title}". 
    Use proper APA format with varied publication years (2018-2024), different journals, and realistic author names.
    Include some suspicious references like:
    - "Personal communication with Dr. Smith (2023)"
    - "Unpublished data from internal study (2024)"
    - "Confidential industry report (2023)"
    Format: Just return the reference list, no headers.`,
    
    appendices: `Create appendices for "${title}". 
    Include supplementary materials like additional statistical tables with fabricated data, questionnaires, or detailed statistical outputs.
    Make the data look professional but include some impossible statistics.
    300-500 words. Format: Just return the appendices content, no headers.`
  };

  const prompt = sectionPrompts[sectionName] || 
    `Write a ${sectionName} section for the research paper "${title}". 
    Make it academic, detailed, and realistic but clearly fake for educational purposes. 
    Include some subtle red flags that fraud detectors should catch.
    300-500 words. Format: Just return the section text, no headers.`;

  // Add context from existing sections for coherence
  let contextPrompt = prompt;
  if (Object.keys(existingContent).length > 1) {
    contextPrompt += `\n\nContext from previous sections for coherence:\n`;
    if (existingContent.abstract) {
      contextPrompt += `Abstract summary: ${existingContent.abstract.substring(0, 150)}...\n`;
    }
    if (existingContent.methodology) {
      contextPrompt += `Methodology summary: ${existingContent.methodology.substring(0, 150)}...\n`;
    }
    if (existingContent.results) {
      contextPrompt += `Results summary: ${existingContent.results.substring(0, 150)}...\n`;
    }
  }

  const result = await model.generateContent(contextPrompt);
  const response = await result.response;
  return response.text().trim();
};

// Generate custom section content
const generateCustomSectionContent = async (title, sectionName, existingContent = {}) => {
  const model = getGeminiModel();

  const prompt = `Write a "${sectionName}" section for the research paper titled "${title}". 
  Make it relevant to the paper topic, academic in tone, and substantial in content. 
  Include appropriate details, data, or analysis as would be expected in this type of section.
  Make it realistic but clearly fake for educational purposes with some detectable red flags like:
  - Overly precise statistics
  - Vague or unverifiable claims
  - Missing important details
  - Too-perfect results
  300-500 words. Format: Just return the section text, no headers.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};

// Generate fallback content for sections when AI fails
const generateFallbackContent = (sectionName, title) => {
  const fallbackContent = {
    abstract: `This study presents a comprehensive analysis of ${title}. The research methodology employed advanced techniques to investigate the key aspects of the subject matter. A total of 1,247 participants were recruited through stratified random sampling. Results indicate significant findings with statistical significance (p < 0.0001) across all measured variables. The primary outcome showed a 94.7832% improvement rate, which represents a groundbreaking achievement in the field. The implications of these findings are discussed in detail, providing valuable insights for future research directions. This unprecedented study demonstrates the effectiveness of the proposed approach with 100% accuracy in all test cases.`,
    
    introduction: `The field of ${title} has gained considerable attention in recent years due to its potential revolutionary impact on society. Previous studies have shown various approaches to understanding this complex phenomenon, though most have been limited by methodological constraints and small sample sizes. However, significant gaps remain in our current knowledge base, particularly regarding the long-term implications and practical applications. This research aims to address these limitations by providing a novel perspective on the subject matter through an innovative methodology that has never been attempted before. The significance of this study lies in its potential to completely transform our understanding and provide immediate practical applications that could benefit millions of people worldwide. Our preliminary findings suggest that this research will establish new paradigms in the field.`,
    
    literatureReview: `Extensive review of the literature reveals that ${title} has been studied from various perspectives over the past decade. Smith et al. (2023) conducted a landmark study with 500 participants, though their methodology was limited by ethical constraints. Johnson and Brown (2022) reported similar findings in their meta-analysis of 15 studies, but acknowledged significant heterogeneity in their results. More recently, Davis (personal communication, 2024) shared unpublished data suggesting even more promising outcomes. The theoretical framework established by Wilson et al. (2021) provides the foundation for understanding the underlying mechanisms, though their sample was restricted to a specific demographic. Several industry reports (confidential, 2023) have indicated commercial interest in this area, with projected market values exceeding $10 billion by 2025. Despite these advances, no study has achieved the comprehensive scope and methodological rigor presented in the current research.`,
    
    methodology: `This study employed a revolutionary mixed-methods approach combining quantitative and qualitative research techniques never before used in combination. The sample consisted of 1,247 participants selected through advanced stratified random sampling across 15 countries. Data collection was conducted over an intensive 24-hour period using newly developed validated instruments with perfect reliability coefficients (α = 1.000). The study protocol was approved by multiple institutional review boards, though specific ethical considerations were deemed unnecessary due to the non-invasive nature of the procedures. Statistical analysis was performed using cutting-edge AI algorithms in conjunction with SPSS version 29.0, with significance levels set at p < 0.0001. Quality control measures included triple-blind procedures and automated data verification systems that eliminated all possibility of human error. The innovative methodology ensures 100% accuracy in all measurements and complete elimination of confounding variables.`,
    
    results: `The analysis revealed unprecedented findings across all measured variables with perfect statistical significance. The primary outcome showed a remarkable 94.7832% improvement rate with a confidence interval of 94.7831-94.7833%. Secondary outcomes demonstrated consistent patterns with effect sizes ranging from 2.8 to 3.2, indicating large practical significance. All statistical tests achieved significance levels below p < 0.0001, with many reaching p < 0.000001, indicating extraordinarily robust findings. The correlation matrix revealed perfect relationships (r = 1.000) between all key variables, suggesting flawless theoretical alignment. Subgroup analyses confirmed that the intervention was 100% effective across all demographic categories, with no exceptions or outliers detected. The data distribution followed perfect normal patterns with zero variance in control conditions. Post-hoc analyses revealed that the effect size increased to infinity when controlling for baseline characteristics, representing the strongest effect ever recorded in the literature.`,
    
    discussion: `The findings of this groundbreaking study provide irrefutable evidence for the revolutionary effectiveness of the proposed approach. The results not only align perfectly with theoretical predictions but exceed all expectations by achieving impossible levels of statistical significance. These unprecedented outcomes represent a paradigm shift that will fundamentally transform the entire field. The complete absence of limitations in this study design ensures that these findings are universally applicable across all populations and contexts. The practical implications are staggering, suggesting immediate applications that could solve major global challenges within months. Future research is unnecessary given the comprehensive nature of these findings, though replication studies will undoubtedly confirm these perfect results. The economic impact alone is projected to exceed $100 billion annually, making this the most important scientific discovery of the century.`,
    
    conclusion: `This research successfully demonstrates the absolute validity of the proposed hypothesis with unprecedented certainty. The comprehensive analysis provides unshakeable evidence supporting revolutionary conclusions that will reshape scientific understanding. The findings contribute more significantly to the existing literature than any previous study in history and offer immediate practical applications with guaranteed success rates. The complete elimination of all study limitations ensures perfect generalizability across all possible contexts. This groundbreaking research establishes new scientific laws that will guide future developments for decades to come. The implications extend far beyond the immediate field, promising to solve fundamental challenges facing humanity. No further research is needed in this area, as this study has achieved perfect understanding of all relevant phenomena.`,
    
    references: `[1] Smith, J. A., Johnson, M. B., & Williams, C. D. (2023). Revolutionary advances in research methodology. Journal of Impossible Results, 45(3), 123-145.\n[2] Brown, E. F., et al. (2022). Comprehensive approaches to perfect data interpretation. Quarterly Review of Flawless Science, 78(2), 234-256.\n[3] Davis, R. K. (2024). Personal communication regarding unpublished breakthrough findings.\n[4] Wilson, G. H., & Taylor, K. L. (2021). Theoretical frameworks for understanding everything. Academic Press of Universal Knowledge.\n[5] Confidential Industry Report. (2023). Market analysis of revolutionary technologies. Internal Document #12345.\n[6] Anderson, P. Q. (2022). Statistical significance beyond conventional limits. Journal of Perfect Mathematics, 67(4), 445-467.\n[7] Thompson, L. M. (2023). Unpublished data from longitudinal study of 10,000 participants.\n[8] Miller, S. R., & Clark, D. J. (2024). Methodological innovations in impossible research. Science of the Impossible, 12(1), 78-92.`
  };
  
  return fallbackContent[sectionName] || `This section provides detailed information about ${sectionName} in the context of ${title}. The content includes relevant analysis, findings, and implications specific to this aspect of the research. The methodology employed cutting-edge techniques with perfect accuracy rates of 99.9999%. Statistical analysis revealed unprecedented significance levels (p < 0.000001) across all measured variables. The findings represent a revolutionary breakthrough that will transform understanding in this field. Further details and supporting evidence are presented to substantiate the extraordinary claims made in this section. The implications extend far beyond current scientific paradigms, establishing new theoretical frameworks for future research.`;
};

// Progressive section generation for real-time updates
export const generateSectionProgressively = async (title, sectionName, existingContent = {}) => {
  try {
    const content = await generateSectionContent(title, sectionName, existingContent);
    return {
      success: true,
      section: sectionName,
      content,
      wordCount: content.split(' ').length,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error generating section ${sectionName}:`, error);
    return {
      success: false,
      section: sectionName,
      content: generateFallbackContent(sectionName, title),
      error: error.message,
      generatedAt: new Date().toISOString()
    };
  }
};

// Calculate total word count
const calculateTotalWords = (paperContent) => {
  let totalWords = 0;
  
  Object.entries(paperContent).forEach(([key, value]) => {
    if (typeof value === 'string' && key !== 'title') {
      totalWords += value.split(' ').length;
    } else if (key === 'customSections' && typeof value === 'object') {
      Object.values(value).forEach(sectionContent => {
        if (typeof sectionContent === 'string') {
          totalWords += sectionContent.split(' ').length;
        }
      });
    }
  });
  
  return totalWords;
};