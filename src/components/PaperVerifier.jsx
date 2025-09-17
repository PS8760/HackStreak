import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PaperVerifier = () => {
  const { user, saveVerificationToHistory } = useAuth();
  const [step, setStep] = useState(1); // 1: Choose method, 2: Input content, 3: Results
  const [inputMethod, setInputMethod] = useState(''); // 'text' or 'pdf'
  const [paperText, setPaperText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const fileInputRef = useRef(null);

  // Extract text from PDF file
  const extractTextFromPDF = async (file) => {
    try {
      setExtracting(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.');
    } finally {
      setExtracting(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB.');
      return;
    }
    setUploadedFile(file);
    try {
      const extractedText = await extractTextFromPDF(file);
      setPaperText(extractedText);
    } catch (error) {
      alert(error.message);
      setUploadedFile(null);
    }
  };

  // Detect fake content patterns in research papers
  const detectFakeContentPatterns = (text) => {
    const fakePatterns = {
      fabricatedData: { pattern: /(\d+\.\d{4,}%|\d{4,}\.\d+|\d+\.\d{8,})/g, description: 'Suspiciously precise or unrealistic numerical data', severity: 'high', category: 'Data Fabrication' },
      impossibleResults: { pattern: /(100% accuracy|0% error rate|perfect correlation|100% success rate|zero failures|flawless results)/gi, description: 'Claims of impossible or highly unlikely perfect results', severity: 'high', category: 'Result Fabrication' },
      vagueCitations: { pattern: /(personal communication|unpublished data|internal report|confidential study|private correspondence)/gi, description: 'References to unverifiable or suspicious sources', severity: 'medium', category: 'Citation Issues' },
      inconsistentMethodology: { pattern: /(sample size.*varied|methodology.*changed|different approaches.*same study|protocol.*modified)/gi, description: 'Inconsistent or unclear methodology descriptions', severity: 'medium', category: 'Methodology Issues' },
      unrealisticTimeline: { pattern: /(conducted.*same day|completed.*24 hours|instant results|immediate analysis|overnight study)/gi, description: 'Unrealistic timeframes for research activities', severity: 'medium', category: 'Timeline Issues' },
      duplicatedContent: { pattern: /(.{50,})\1/g, description: 'Repeated content blocks that may indicate copy-paste errors', severity: 'medium', category: 'Content Duplication' },
      suspiciousStatistics: { pattern: /(p\s*=\s*0\.0000|p\s*<\s*0\.0001.*p\s*<\s*0\.0001|all.*significant|every.*significant)/gi, description: 'Suspicious statistical reporting patterns', severity: 'high', category: 'Statistical Issues' },
      missingEthics: { pattern: /(?=.*human|.*patient|.*participant)(?!.*ethics|.*IRB|.*institutional review|.*consent|.*approval)/gi, description: 'Missing ethical considerations for human research', severity: 'low', category: 'Ethics Compliance' }
    };
    const detectedIssues = [];
    const suspiciousContent = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    Object.entries(fakePatterns).forEach(([key, { pattern, description, severity, category }]) => {
      const matches = text.match(pattern) || [];
      if (matches.length > 0) {
        detectedIssues.push({ type: key, description, severity, category, count: matches.length, examples: matches.slice(0, 3).map(match => match.substring(0, 100)) });
        sentences.forEach((sentence, index) => {
          if (pattern.test(sentence)) {
            suspiciousContent.push({ sentenceIndex: index + 1, content: sentence.trim(), issue: category, severity });
          }
        });
      }
    });
    return { detectedIssues, suspiciousContent: suspiciousContent.slice(0, 10) };
  };

  // Analyze research paper structure
  const analyzeResearchStructure = (text) => {
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
      foundSections[section] = !!matches;
      if (foundSections[section]) totalSections++;
    });
    const words = text.split(/\s+/).filter(w => w.length > 0);
    return { foundSections, totalSections, wordCount: words.length, hasProperStructure: totalSections >= 4 };
  };

  // Check for authenticity indicators
  const checkContentAuthenticity = (text) => {
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

  // Handle verification process
  const handleVerification = async () => {
    if (!paperText.trim()) {
      alert('Please provide content to analyze');
      return;
    }
    setLoading(true);
    // ✅ FIX 1: Corrected typo from "mulate cmise" to "new Promise"
    await new Promise(resolve => setTimeout(resolve, 3000));
    const fakePatterns = detectFakeContentPatterns(paperText);
    const structureAnalysis = analyzeResearchStructure(paperText);
    const authenticityCheck = checkContentAuthenticity(paperText);
    let fakeProbability = 0;
    fakePatterns.detectedIssues.forEach(issue => {
      switch (issue.severity) {
        case 'high': fakeProbability += issue.count * 20; break;
        case 'medium': fakeProbability += issue.count * 10; break;
        default: fakeProbability += issue.count * 5; break;
      }
    });
    if (!structureAnalysis.hasProperStructure) fakeProbability += 15;
    if (authenticityCheck.totalAuthenticityPoints < 3) fakeProbability += 20;
    if (structureAnalysis.wordCount < 1000) fakeProbability += 10;
    if (authenticityCheck.totalAuthenticityPoints > 10) fakeProbability -= 15;
    if (structureAnalysis.totalSections >= 6) fakeProbability -= 10;
    fakeProbability = Math.min(95, Math.max(5, fakeProbability));
    const result = {
      fakeProbability: Math.round(fakeProbability),
      isLikelyFake: fakeProbability > 60,
      confidence: fakeProbability > 80 ? 'High' : fakeProbability > 40 ? 'Medium' : 'Low',
      detectedIssues: fakePatterns.detectedIssues,
      suspiciousContent: fakePatterns.suspiciousContent,
      structureAnalysis,
      authenticityCheck,
      recommendations: generateRecommendations(fakeProbability, fakePatterns.detectedIssues)
    };
    setVerificationResult(result);
    setStep(3);
    try {
      if (user) {
        await saveVerificationToHistory({
          text: paperText.substring(0, 500),
          fakeProbability: result.fakeProbability,
          isLikelyFake: result.isLikelyFake,
          confidence: result.confidence,
          detectedPatterns: result.detectedIssues,
          fileName: uploadedFile?.name || 'Manual Input'
        });
      }
    } catch (error) {
      console.error('Error saving verification to history:', error);
    }
    setLoading(false);
  };

  const generateRecommendations = (probability, issues) => {
    const recommendations = [];
    if (probability > 70) recommendations.push('This paper shows strong indicators of fabricated content. Requires thorough manual review.');
    if (issues.some(issue => issue.category === 'Data Fabrication')) recommendations.push('Verify all numerical data and statistics with original sources.');
    if (issues.some(issue => issue.category === 'Citation Issues')) recommendations.push('Check all citations for verifiability and proper formatting.');
    if (issues.some(issue => issue.category === 'Statistical Issues')) recommendations.push('Statistical results appear suspicious. Consult with a statistician.');
    if (recommendations.length === 0) recommendations.push('The paper appears to have authentic content characteristics.');
    return recommendations;
  };

  const resetVerification = () => {
    setStep(1);
    setInputMethod('');
    setPaperText('');
    setUploadedFile(null);
    setVerificationResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = { 'Data Fabrication': '📊', 'Result Fabrication': '🎯', 'Citation Issues': '📚', 'Methodology Issues': '🔬', 'Timeline Issues': '⏰', 'Ethics Compliance': '⚖️', 'Content Duplication': '📋', 'Statistical Issues': '📈' };
    return icons[category] || '⚠️';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Please log in to access the Paper Verification tool.</p>
          <a href="/login" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">Login to Continue</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Research Paper Fake Content Detector</h1>
          <p className="text-lg text-gray-600 mb-2">Detect fabricated data and fake content in research papers</p>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 text-left max-w-3xl mx-auto"><div className="flex"><div className="flex-shrink-0"><span className="text-red-400 text-xl">🚨</span></div><div className="ml-3"><p className="text-sm text-red-700"><strong>Fake Content Detection:</strong> This tool analyzes research papers for fabricated data, impossible results, suspicious citations, and other indicators of fraudulent content.</p></div></div></div>
        </div>
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* ✅ FIX 2: Corrected garbled text in the heading */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              How would you like to provide the research paper?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => { setInputMethod('text'); setStep(2); }} className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-center group"><div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📝</div><h3 className="text-xl font-semibold text-gray-800 mb-2">Manual Text Input</h3><p className="text-gray-600">Copy and paste the research paper content directly</p></button>
              <button onClick={() => { setInputMethod('pdf'); setStep(2); }} className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 text-center group"><div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📄</div><h3 className="text-xl font-semibold text-gray-800 mb-2">Upload PDF File</h3><p className="text-gray-600">Upload a PDF file (max 10MB) for automatic text extraction</p></button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-gray-800">{inputMethod === 'text' ? 'Enter Research Paper Content' : 'Upload PDF File'}</h2><button onClick={resetVerification} className="text-gray-500 hover:text-gray-700 text-sm font-medium">← Change Method</button></div>
            {inputMethod === 'text' && (
              <div className="space-y-4"><label className="block text-sm font-medium text-gray-700">Research Paper Content *</label><textarea value={paperText} onChange={(e) => setPaperText(e.target.value)} placeholder="Paste the complete research paper content here..." rows={15} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" /><p className="text-sm text-gray-500">{paperText.length} characters • {paperText.split(/\s+/).filter(w => w.length > 0).length} words</p></div>
            )}
            {inputMethod === 'pdf' && (
              <div className="space-y-4"><label className="block text-sm font-medium text-gray-700">Upload Research Paper PDF *</label><div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"><input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                {uploadedFile ? (
                  <div className="space-y-4"><div className="text-green-600 text-6xl">✅</div><div><p className="text-lg font-medium text-gray-700">{uploadedFile.name}</p><p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p></div><button type="button" onClick={() => { setUploadedFile(null); setPaperText(''); fileInputRef.current.value = ''; }} className="text-red-600 hover:text-red-700 text-sm font-medium">Remove File</button></div>
                ) : (
                  <div className="space-y-4"><div className="text-gray-400 text-6xl">📄</div><div><button type="button" onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">Choose PDF File</button><p className="text-sm text-gray-500 mt-2">Supports PDF files up to 10MB</p></div></div>
                )}
              </div>
                {/* ✅ FIX 3: Corrected invalid Tailwind class from "text-b" to "text-blue-600" */}
                {extracting && (
                  <div className="flex items-center justify-center text-blue-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>Extracting text from PDF...
                  </div>
                )}
                {paperText && (
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Extracted Text Preview</label><div className="max-h-40 overflow-y-auto bg-gray-50 p-4 rounded-lg border text-sm">{paperText.substring(0, 1000)}...</div><p className="text-sm text-gray-500 mt-2">{paperText.length} characters extracted</p></div>
                )}
              </div>
            )}
            <div className="flex justify-center mt-8"><button onClick={handleVerification} disabled={!paperText.trim() || extracting || loading} className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">{loading ? (<div className="flex items-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Analyzing for Fake Content...</div>) : ('🔍 Detect Fake Content')}</button></div>
          </div>
        )}
        {step === 3 && verificationResult && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-gray-800">Fake Content Analysis Results</h2><button onClick={resetVerification} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium">New Analysis</button></div>
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border-2 ${verificationResult.isLikelyFake ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}><div className="flex items-center justify-between mb-4"><h3 className="text-xl font-semibold">{verificationResult.isLikelyFake ? '🚨 Likely Contains Fake Content' : '✅ Appears Authentic'}</h3><span className={`px-3 py-1 rounded-full text-sm font-medium ${verificationResult.confidence === 'High' ? 'bg-red-100 text-red-800' : verificationResult.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{verificationResult.confidence} Confidence</span></div><div className="mb-4"><div className="flex justify-between text-sm mb-2"><span>Fake Content Probability</span><span className="font-medium">{verificationResult.fakeProbability}%</span></div><div className="w-full bg-gray-200 rounded-full h-4"><div className={`h-4 rounded-full transition-all duration-1000 ${verificationResult.fakeProbability > 70 ? 'bg-red-500' : verificationResult.fakeProbability > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${verificationResult.fakeProbability}%` }}></div></div></div></div>
              {verificationResult.detectedIssues.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🚨 Suspicious Content Detected ({verificationResult.detectedIssues.length} issues)</h3>
                  <div className="space-y-3">
                    {verificationResult.detectedIssues.map((issue, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}><div className="flex justify-between items-start mb-2"><div className="flex items-center"><span className="mr-2 text-lg">{getCategoryIcon(issue.category)}</span><h4 className="font-medium">{issue.category}</h4></div><span className="text-xs px-2 py-1 rounded-full bg-white font-medium">{issue.count} found</span></div><p className="text-sm mb-2">{issue.description}</p>
                        {issue.examples.length > 0 && (<div className="text-xs"><strong>Examples:</strong><ul className="list-disc list-inside mt-1 space-y-1">{issue.examples.map((example, i) => (<li key={i} className="text-gray-700">{example}...</li>))}</ul></div>)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {verificationResult.suspiciousContent.length > 0 && (
                <div><h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Suspicious Content Sections</h3><div className="space-y-3">{verificationResult.suspiciousContent.map((content, index) => (<div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-yellow-800">Sentence {content.sentenceIndex} - {content.issue}</span><span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(content.severity)}`}>{content.severity}</span></div><p className="text-sm text-gray-700 italic">"{content.content}"</p></div>))}</div></div>
              )}
              <div><h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Recommendations</h3><div className="space-y-2">{verificationResult.recommendations.map((rec, index) => (<div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"><span className="text-blue-600 mt-0.5">💡</span><span className="text-sm text-blue-800">{rec}</span></div>))}</div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperVerifier;