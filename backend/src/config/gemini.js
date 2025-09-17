import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
let genAI = null;

try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } else {
    console.warn('GEMINI_API_KEY not found in environment variables');
  }
} catch (error) {
  console.error('Error initializing Gemini AI:', error);
}

// Get Gemini model instance
export const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  if (!genAI) {
    throw new Error('Gemini AI not initialized. Please check your API key.');
  }
  
  return genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  });
};

// Test Gemini connection
export const testGeminiConnection = async () => {
  try {
    if (!genAI) {
      return { success: false, error: 'Gemini AI not initialized' };
    }
    
    const model = getGeminiModel();
    const result = await model.generateContent('Hello, this is a test.');
    const response = await result.response;
    
    return { 
      success: true, 
      message: 'Gemini AI connection successful',
      testResponse: response.text().substring(0, 100)
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Failed to connect to Gemini AI'
    };
  }
};

export default genAI;