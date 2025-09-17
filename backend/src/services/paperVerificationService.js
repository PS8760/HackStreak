// Detect fake content patterns in research papers
export const detectFakeContentPatterns = (text) => {
  const fakePatterns = {
    fabricatedData: {
      pattern: /(\d+\.\d{4,}%|\d{4,}\.\d+|\d+\.\d{8,})/g,
      description: 'Suspiciously precise or unrealistic numerical data',
      severity: 'high',
      category: 'Data Fabrication'
    },
    impossibleResults: {
      pattern: /(100% accuracy|0% error rate|perfect correlation|100% success rate|zero failures|flawless results)/gi,
      description: 'Claims of impossible or highly unlikely perfect results',
      severity: 'high',
      category: 'Result Fabrication'
    },
    vagueCitations: {
      pattern: /(personal communication|unpublished data|internal report|confidential study|private correspondence)/gi,
      description: 'References to unverifiable or suspicious sources',
      severity: 'medium',
      category: 'Citation Issues'
    },
    inconsistentMethodology: {
      pattern: /(sample size.*varied|methodology.*changed|different approaches.*same study|protocol.*modified)/gi,
      description: 'Inconsistent or unclear methodology descriptions',
      severity: 'medium',
      category: 'Methodology Issues'
    },
    unrealisticTimeline: {
      pattern: /(conducted.*same day|completed.*24 hours|instant results|immediate analysis|overnight study)/gi,
      description: 'Unrealistic timeframes for research activities',
      severity: 'medium',
      category: 'Timeline Issues'
    },
    duplicatedContent: {
      pattern: /(.{50,})\1/g,
      description: 'Repeated content blocks that may indicate copy-paste errors',
      severity: 'medium',
      category: 'Content Duplication'
    },
    suspiciousStatistics: {
      pattern: /(p\s*=\s*0\.0000|p\s*<\s*0\.0001.*p\s*<\s*0\.0001|all.*significant|every.*significant)/gi,
      description: 'Suspicious statistical reporting patterns',
      severity: 'high',
      category: 'Statistical Issues'
    },
    missingEthics: {
      pattern: /(?=.*human|.*patient|.*participant)(?!.*ethics|.*IRB|.*institutional review|.*consent|.*approval)/gi,
      description: 'Missing ethical considerations for human research',
      severity: 'low',
      category: 'Ethics Compliance'
    }
  };
  const detectedIssues = [];
  const suspiciousContent = [];
  let totalSuspiciousPatterns = 0;
  // Split text into sentences for detailed analysis
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  Object.entries(fakePatterns).forEach(([key, { pattern, description, severity, category }]) => {
    const matches = text.match(pattern) || [];
    if (matches.length > 0) {
      detectedIssues.push({
        type: key,
        description,
        severity,
        category,
        count: matches.length,
        examples: matches.slice(0, 3).map(match => match.substring(0, 100))
      });
      totalSuspiciousPatterns += matches.length;
      // Find sentences containing these patterns
      sentences.forEach((sentence, index) => {
        if (pattern.test(sentence)) {
          suspiciousContent.push({
            sentenceIndex: index + 1,
            content: sentence.trim(),
            issue: category,
            severity
          });
        }
      });
    }
  });
  return {
    detectedIssues,
    totalSuspiciousPatterns,
    suspiciousContent: suspiciousContent.slice(0, 10) // Limit to top 10
  };
};

// Analyze research paper structure
export const analyzeResearchStructure = (text) => {
  const sections = {
    abstract: /abstract[\s\S]{50,500}/gi,
    introduction: /introduction[\s\S]{100,1000}/gi,
    methodology: /(methodology|methods)[\s\S]{100,1000}/gi,
    results: /results[\s\S]{100,1000}/gi,
    discussion: /discussion[\s\S]{100,1000}/gi,
    conclusion: /conclusion[\s\S]{50,500}/gi,
    references: /(references|bibliography)[\s\S]{50,}/gi
  };
  const foundSections = {};
  let totalSections = 0;
  Object.entries(sections).forEach(([section, pattern]) => {
    const matches = text.match(pattern);
    foundSections[section] = matches ? matches.length > 0 : false;
    if (foundSections[section]) totalSections++;
  });
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return {
    foundSections,
    totalSections,
    wordCount: words.length,
    sentenceCount: sentences.length,
    hasProperStructure: totalSections >= 4
  };
};

// Check for authenticity indicators
export const checkContentAuthenticity = (text) => {
  const authenticityChecks = {
    hasSpecificDates: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/gi,
    hasSpecificLocations: /\b(university of|institute of|college of|hospital|laboratory|department of)\s+[\w\s]+/gi,
    hasRealJournals: /\b(nature|science|cell|lancet|nejm|plos|ieee|acm|springer|elsevier)\b/gi,
    hasProperCitations: /\[\d+\]|\(\w+\s+et\s+al\.?,?\s+\d{4}\)/g,
    hasContactInfo: /(email|correspondence|contact).*@.*\.(edu|org|com)/gi
  };
  const authenticityScore = {};
  let totalAuthenticityPoints = 0;
  Object.entries(authenticityChecks).forEach(([check, pattern]) => {
    const matches = text.match(pattern) || [];
    authenticityScore[check] = matches.length;
    totalAuthenticityPoints += matches.length;
  });
  return { authenticityScore, totalAuthenticityPoints };
};

// Enhanced comprehensive paper verification with AI integration
export const verifyPaperAuthenticity = async (text) => {
  try {
    // Perform comprehensive local analysis
    const localAnalysis = await performLocalAnalysis(text);
    
    // Enhance with AI analysis if available
    let aiAnalysis = null;
    try {
      aiAnalysis = await performAIAnalysis(text);
    } catch (error) {
      console.warn('AI analysis failed, using local analysis only:', error.message);
    }
    
    // Combine analyses for final result
    return combineAnalyses(localAnalysis, aiAnalysis);
    
  } catch (error) {
    console.error('Error verifying paper authenticity:', error);
    throw new Error('Failed to verify paper authenticity. Please try again.');
  }
};

// Perform comprehensive local analysis
const performLocalAnalysis = async (text) => {
  const fakePatterns = detectFakeContentPatterns(text);
  const structureAnalysis = analyzeResearchStructure(text);
  const authenticityCheck = checkContentAuthenticity(text);
  const languageAnalysis = analyzeLanguagePatterns(text);
  const citationAnalysis = analyzeCitationPatterns(text);
  const metadataAnalysis = analyzeMetadata(text);
  
  // Calculate fake probability with enhanced factors
  const fakeProbability = calculateEnhancedFakeProbability({
    fakePatterns,
    structureAnalysis,
    authenticityCheck,
    languageAnalysis,
    citationAnalysis,
    metadataAnalysis
  });
  return {
    fakeProbability: Math.round(fakeProbability),
    isLikelyFake: fakeProbability > 60,
    confidence: fakeProbability > 80 ? 'High' : fakeProbability > 40 ? 'Medium' : 'Low',
    detectedIssues: fakePatterns.detectedIssues,
    suspiciousContent: fakePatterns.suspiciousContent,
    structureAnalysis: {
      ...structureAnalysis,
      missingElements: identifyMissingElements(structureAnalysis)
    },
    authenticityCheck,
    languageAnalysis,
    citationAnalysis,
    metadataAnalysis,
    recommendations: generateEnhancedRecommendations(fakeProbability, fakePatterns.detectedIssues, languageAnalysis),
    analysisMethod: 'local',
    timestamp: new Date().toISOString()
  };
};

// AI-powered analysis using Gemini (if available)
const performAIAnalysis = async (text) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
  As an expert in academic integrity and AI-generated content detection, analyze this research paper text for authenticity and potential AI generation.
  
  Focus on these key areas:
  1. AI-generated content indicators (repetitive patterns, unnatural flow, generic statements)
  2. Academic writing quality and authenticity markers
  3. Citation patterns and reference quality assessment
  4. Methodological soundness and data presentation
  5. Language sophistication and consistency analysis
  6. Structural integrity and academic formatting
  
  Text to analyze (truncated for analysis):
  "${text.substring(0, 4000)}"
  
  Provide detailed analysis in this JSON format:
  {
    "aiGeneratedProbability": number (0-100),
    "academicQuality": "excellent|good|fair|poor",
    "aiIndicators": [
      {
        "indicator": "string",
        "confidence": "high|medium|low", 
        "description": "string",
        "severity": "critical|major|minor"
      }
    ],
    "authenticity": {
      "score": number (0-10),
      "factors": ["string"],
      "concerns": ["string"]
    },
    "writingAnalysis": {
      "naturalness": number (0-10),
      "complexity": number (0-10),
      "consistency": number (0-10)
    },
    "recommendations": ["string"]
  }
  `;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();
  
  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error('Invalid AI response format');
};

// Combine local and AI analyses
const combineAnalyses = (localAnalysis, aiAnalysis) => {
  if (!aiAnalysis) {
    return { ...localAnalysis, analysisMethod: 'local_only' };
  }
  
  // Weighted combination of probabilities (local 60%, AI 40%)
  const combinedProbability = Math.round(
    (localAnalysis.fakeProbability * 0.6) + (aiAnalysis.aiGeneratedProbability * 0.4)
  );
  
  // Enhanced confidence calculation
  const confidenceFactors = [
    localAnalysis.confidence,
    aiAnalysis.authenticity.score > 7 ? 'High' : aiAnalysis.authenticity.score > 4 ? 'Medium' : 'Low'
  ];
  
  const finalConfidence = confidenceFactors.includes('High') && !confidenceFactors.includes('Low') 
    ? 'High' 
    : confidenceFactors.includes('Medium') 
    ? 'Medium' 
    : 'Low';
  return {
    ...localAnalysis,
    fakeProbability: combinedProbability,
    isLikelyFake: combinedProbability > 60,
    confidence: finalConfidence,
    aiAnalysis,
    analysisMethod: 'combined',
    enhancedRecommendations: generateCombinedRecommendations(localAnalysis, aiAnalysis)
  };
};

// Analyze language patterns for AI detection
const analyzeLanguagePatterns = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  // Calculate metrics
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  const uniqueWords = new Set(words);
  const vocabularyDiversity = uniqueWords.size / words.length;
  
  // AI-typical patterns
  const aiPatterns = {
    repetitiveStarters: analyzeRepetitiveStarters(sentences),
    transitionOveruse: analyzeTransitionWords(text),
    genericPhrases: analyzeGenericPhrases(text),
    sentenceVariation: analyzeSentenceVariation(sentences)
  };
  
  const issues = [];
  let suspicionScore = 0;
  
  if (avgSentenceLength > 25) {
    issues.push('Unusually long average sentence length may indicate AI generation');
    suspicionScore += 15;
  }
  
  if (vocabularyDiversity < 0.3) {
    issues.push('Low vocabulary diversity suggests limited language model');
    suspicionScore += 20;
  }
  
  if (aiPatterns.repetitiveStarters.score > 0.3) {
    issues.push('High repetition in sentence structures');
    suspicionScore += 25;
  }
  
  return {
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    vocabularyDiversity: Math.round(vocabularyDiversity * 100),
    suspicionScore,
    aiPatterns,
    issues,
    naturalness: Math.max(0, 100 - suspicionScore)
  };
};

// Analyze citation patterns for authenticity
const analyzeCitationPatterns = (text) => {
  const citationFormats = {
    numbered: (text.match(/\[\d+\]/g) || []).length,
    authorYear: (text.match(/\(\w+\s*,?\s*\d{4}\)/g) || []).length,
    etAl: (text.match(/\w+\s+et\s+al\.?\s*,?\s*\d{4}/gi) || []).length,
    doi: (text.match(/doi:\s*10\.\d+/gi) || []).length
  };
  
  const totalCitations = Object.values(citationFormats).reduce((sum, count) => sum + count, 0);
  const hasReferenceSection = /references|bibliography/i.test(text);
  
  // Analyze citation quality
  const suspiciousCitations = [
    (text.match(/personal communication/gi) || []).length,
    (text.match(/unpublished data/gi) || []).length,
    (text.match(/internal report/gi) || []).length
  ].reduce((sum, count) => sum + count, 0);
  
  const issues = [];
  if (totalCitations === 0 && text.length > 2000) {
    issues.push('No citations found in substantial text');
  }
  if (suspiciousCitations > totalCitations * 0.3) {
    issues.push('High proportion of unverifiable citations');
  }
  if (totalCitations > 0 && !hasReferenceSection) {
    issues.push('Citations present but no reference section found');
  }
  
  return {
    totalCitations,
    citationFormats,
    hasReferenceSection,
    suspiciousCitations,
    citationDensity: text.length > 0 ? Math.round((totalCitations / (text.length / 1000)) * 10) / 10 : 0,
    issues
  };
};

// Analyze document metadata and formatting
const analyzeMetadata = (text) => {
  const metadata = {
    hasTitle: /^.{10,200}$/m.test(text.split('\n')[0] || ''),
    hasAbstract: /abstract/i.test(text),
    hasKeywords: /keywords?:/i.test(text),
    hasAuthorInfo: /(author|affiliation|email|university|institute)/i.test(text),
    hasPageNumbers: /page\s+\d+|\d+\s+of\s+\d+/i.test(text),
    hasHeaders: /^\s*\d+\.?\s+[A-Z]/m.test(text)
  };
  
  const formattingScore = Object.values(metadata).filter(Boolean).length;
  
  return {
    metadata,
    formattingScore,
    professionalFormatting: formattingScore >= 4
  };
};

// Enhanced fake probability calculation
const calculateEnhancedFakeProbability = (analyses) => {
  let probability = 0;
  
  // Base pattern analysis (40% weight)
  analyses.fakePatterns.detectedIssues.forEach(issue => {
    const multiplier = { high: 15, medium: 8, low: 3 }[issue.severity] || 5;
    probability += issue.count * multiplier;
  });
  
  // Structure analysis (20% weight)
  if (!analyses.structureAnalysis.hasProperStructure) probability += 20;
  if (analyses.structureAnalysis.wordCount < 1000) probability += 15;
  
  // Language patterns (25% weight)
  probability += analyses.languageAnalysis.suspicionScore * 0.8;
  
  // Citation analysis (10% weight)
  if (analyses.citationAnalysis.issues.length > 2) probability += 15;
  if (analyses.citationAnalysis.totalCitations === 0 && analyses.structureAnalysis.wordCount > 2000) {
    probability += 10;
  }
  
  // Metadata analysis (5% weight)
  if (!analyses.metadataAnalysis.professionalFormatting) probability += 10;
  
  // Authenticity bonuses (reduce probability)
  if (analyses.authenticityCheck.totalAuthenticityPoints > 8) probability -= 20;
  if (analyses.citationAnalysis.totalCitations > 15) probability -= 10;
  if (analyses.languageAnalysis.naturalness > 80) probability -= 15;
  
  return Math.min(95, Math.max(5, probability));
};

// Helper functions for language analysis
const analyzeRepetitiveStarters = (sentences) => {
  const starters = sentences.map(s => s.trim().substring(0, 15).toLowerCase());
  const uniqueStarters = new Set(starters);
  return {
    score: 1 - (uniqueStarters.size / starters.length),
    examples: [...new Set(starters)].slice(0, 5)
  };
};
const analyzeTransitionWords = (text) => {
  const transitions = ['however', 'furthermore', 'moreover', 'therefore', 'consequently', 'additionally'];
  let count = 0;
  transitions.forEach(word => {
    count += (text.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
  });
  return { count, density: count / (text.length / 1000) };
};
const analyzeGenericPhrases = (text) => {
  const genericPhrases = [
    'it is important to note',
    'furthermore, it should be noted',
    'in conclusion, it can be said',
    'this study demonstrates that',
    'the results clearly show'
  ];
  
  let matches = 0;
  genericPhrases.forEach(phrase => {
    matches += (text.toLowerCase().match(new RegExp(phrase, 'g')) || []).length;
  });
  
  return { matches, phrases: genericPhrases.slice(0, 3) };
};
const analyzeSentenceVariation = (sentences) => {
  const lengths = sentences.map(s => s.split(' ').length);
  const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
  
  return {
    avgLength: Math.round(avgLength * 10) / 10,
    variance: Math.round(variance * 10) / 10,
    variation: variance > 50 ? 'high' : variance > 20 ? 'medium' : 'low'
  };
};

// Identify missing structural elements
const identifyMissingElements = (structureAnalysis) => {
  const required = ['abstract', 'introduction', 'methodology', 'results', 'conclusion', 'references'];
  return required.filter(element => !structureAnalysis.foundSections[element]);
};

// Generate enhanced recommendations
const generateEnhancedRecommendations = (probability, issues, languageAnalysis) => {
  const recommendations = [];
  
  if (probability > 80) {
    recommendations.push('🚨 CRITICAL: Very high probability of fabricated content - immediate manual review required');
  } else if (probability > 60) {
    recommendations.push('⚠️ HIGH RISK: Significant concerns detected - thorough verification needed');
  } else if (probability > 40) {
    recommendations.push('⚡ MODERATE RISK: Some suspicious patterns found - additional checks recommended');
  } else {
    recommendations.push('✅ LOW RISK: Content appears authentic with normal characteristics');
  }
  
  // Specific issue-based recommendations
  const uniqueCategories = [...new Set(issues.map(issue => issue.category))];
  uniqueCategories.forEach(category => {
    switch (category) {
      case 'Data Fabrication':
        recommendations.push('📊 Verify all statistical data and numerical claims with original sources');
        break;
      case 'Citation Issues':
        recommendations.push('📚 Cross-check all citations for accuracy and verifiability');
        break;
      case 'Statistical Issues':
        recommendations.push('📈 Statistical results require expert statistical review');
        break;
    }
  });
  
  // Language-based recommendations
  if (languageAnalysis.naturalness < 60) {
    recommendations.push('🤖 Language patterns suggest possible AI generation - human review needed');
  }
  
  return recommendations;
};

// Generate combined recommendations from local and AI analysis
const generateCombinedRecommendations = (localAnalysis, aiAnalysis) => {
  const combined = [...new Set(localAnalysis.recommendations)];
  
  if (aiAnalysis.academicQuality === 'poor' && !combined.some(r => r.includes('academic quality'))) {
    combined.push('🎓 AI analysis indicates poor academic quality - content review required');
  }
  
  if (aiAnalysis.aiGeneratedProbability > 70 && !combined.some(r => r.includes('machine-generated'))) {
    combined.push('🤖 AI detection confidence is high - likely machine-generated content');
  }
  
  aiAnalysis.recommendations.forEach(rec => {
    if (!combined.some(existing => existing.includes(rec.substring(0, 20)))) {
      combined.push(`🔍 AI Insight: ${rec}`);
    }
  });
  
  return combined;
};