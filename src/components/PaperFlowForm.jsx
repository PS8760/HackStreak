import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const PaperFlowForm = () => {
  const { user, savePaperToHistory } = useAuth();
  const [paperTitle, setPaperTitle] = useState('');
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSections, setSelectedSections] = useState({
    abstract: false,
    introduction: false,
    dataset: false,
    methodology: false,
    literatureReview: false,
    results: false,
    discussion: false,
    conclusion: false,
    references: false,
    appendices: false
  });
  const [customSections, setCustomSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [showCustomSectionForm, setShowCustomSectionForm] = useState(false);

  const handleCheckboxChange = (section) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCustomSectionToggle = (sectionId) => {
    setCustomSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, selected: !section.selected }
          : section
      )
    );
  };

  const addCustomSection = (e) => {
    e.preventDefault(); // Prevent form submission
    if (!newSectionName.trim()) {
      alert('Please enter a section name');
      return;
    }

    const customSection = {
      id: `custom_${Date.now()}`,
      name: newSectionName.trim(),
      description: newSectionDescription.trim() || 'Custom section added by user',
      selected: true
    };

    setCustomSections(prev => [...prev, customSection]);
    setNewSectionName('');
    setNewSectionDescription('');
    setShowCustomSectionForm(false);
  };

  const removeCustomSection = (sectionId) => {
    setCustomSections(prev => prev.filter(section => section.id !== sectionId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paperTitle.trim()) {
      alert('Please enter a paper title');
      return;
    }

    const selectedStandardSections = Object.entries(selectedSections)
      .filter(([_, isSelected]) => isSelected)
      .map(([section, _]) => section);

    const selectedCustomSections = customSections
      .filter(section => section.selected);

    const allSelectedSections = [...selectedStandardSections, ...selectedCustomSections.map(s => s.name)];

    if (allSelectedSections.length === 0) {
      alert('Please select at least one section to generate');
      return;
    }

    setGenerating(true);

    try {
      // Generate paper content using backend API
      const response = await apiService.generatePaper(
        paperTitle,
        selectedStandardSections,
        selectedCustomSections
      );

      if (response.success) {
        setGeneratedPaper(response.data.paperContent);
        setShowPreview(true);

        // Save to user history if logged in
        if (user) {
          try {
            await savePaperToHistory({
              title: paperTitle,
              sections: selectedStandardSections,
              customSections: selectedCustomSections,
              generatedContent: response.data.paperContent
            });
          } catch (error) {
            console.error('Error saving paper to history:', error);
          }
        }
      } else {
        throw new Error(response.message || 'Failed to generate paper');
      }

    } catch (error) {
      console.error('Error generating paper:', error);
      alert(error.message || 'Failed to generate the research paper. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedPaper) {
      alert('No paper generated yet');
      return;
    }

    try {
      const fileName = `${paperTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      await apiService.generatePaperPDF(generatedPaper, fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(error.message || 'Failed to generate PDF. Please try again.');
    }
  };

  const resetForm = () => {
    setPaperTitle('');
    setSelectedSections({
      abstract: false,
      introduction: false,
      dataset: false,
      methodology: false,
      literatureReview: false,
      results: false,
      discussion: false,
      conclusion: false,
      references: false,
      appendices: false
    });
    setCustomSections([]);
    setGeneratedPaper(null);
    setShowPreview(false);
  };

  const sections = [
    { key: 'abstract', label: 'Abstract', description: 'Brief summary of the research' },
    { key: 'introduction', label: 'Introduction', description: 'Background and problem statement' },
    { key: 'literatureReview', label: 'Literature Review', description: 'Review of existing research' },
    { key: 'dataset', label: 'Fabricated Dataset', description: 'Custom dataset for research' },
    { key: 'methodology', label: 'Methodology', description: 'Research methods and approach' },
    { key: 'results', label: 'Results', description: 'Findings and data analysis' },
    { key: 'discussion', label: 'Discussion', description: 'Interpretation of results' },
    { key: 'conclusion', label: 'Conclusion', description: 'Summary and future work' },
    { key: 'references', label: 'References', description: 'Bibliography and citations' },
    { key: 'appendices', label: 'Appendices', description: 'Additional supporting material' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">PaperFlow Generator</h1>
            <p className="text-lg text-gray-600 mb-2">Generate fake scientific papers for educational purposes</p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left max-w-3xl mx-auto">
              <div className="flex">
                <div className="flex-shrink-0"><span className="text-yellow-400 text-xl">⚠️</span></div>
                <div className="ml-3"><p className="text-sm text-yellow-700"><strong>Educational Purpose:</strong> This tool generates fake scientific papers to help students and researchers learn to identify AI-generated academic fraud. The generated content is intentionally fabricated and should never be used for actual academic submission.</p></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Paper Title Input */}
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <label htmlFor="paperTitle" className="block text-lg font-semibold text-gray-800 mb-3">Research Paper Title *</label>
              <input type="text" id="paperTitle" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} placeholder="Enter the title of your fake research paper..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg" required />
              <p className="text-sm text-gray-600 mt-2">Provide a realistic-sounding academic title for the fake paper</p>
            </div>

            {/* Section Selection */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Sections to Generate</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Sections */}
                {sections.map((section) => (
                  <div key={section.key} className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${selectedSections[section.key] ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'}`} onClick={() => handleCheckboxChange(section.key)}>
                    <div className="flex items-start space-x-4">
                      <input type="checkbox" id={section.key} checked={selectedSections[section.key]} onChange={() => handleCheckboxChange(section.key)} className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2" />
                      <div className="flex-1">
                        <label htmlFor={section.key} className="text-lg font-semibold text-gray-800 cursor-pointer">{section.label}</label>
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* ✨ NEW: Custom Sections List */}
                {customSections.map(section => (
                  <div key={section.id} className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg relative ${section.selected ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 bg-white hover:border-purple-300'}`} onClick={() => handleCustomSectionToggle(section.id)}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeCustomSection(section.id); }} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="flex items-start space-x-4">
                      <input type="checkbox" id={section.id} checked={section.selected} onChange={() => handleCustomSectionToggle(section.id)} className="mt-1 h-5 w-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2" />
                      <div className="flex-1">
                        <label htmlFor={section.id} className="text-lg font-semibold text-gray-800 cursor-pointer">{section.name} <span className="text-sm font-normal text-purple-600">(Custom)</span></label>
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* ✨ NEW: Add Custom Section Button */}
                {!showCustomSectionForm && (
                  <div onClick={() => setShowCustomSectionForm(true)} className="p-6 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 flex items-center justify-center space-x-3 cursor-pointer hover:border-blue-500 hover:text-blue-500 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span className="text-lg font-semibold">Add Custom Section</span>
                  </div>
                )}
              </div>

              {/* ✨ NEW: Custom Section Input Form */}
              {showCustomSectionForm && (
                <div className="mt-6 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">New Custom Section</h3>
                  <div className="space-y-4">
                    <input type="text" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="Section Name (e.g., Acknowledgements)" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <textarea value={newSectionDescription} onChange={(e) => setNewSectionDescription(e.target.value)} placeholder="Optional: Brief description of the section" rows="2" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => setShowCustomSectionForm(false)} className="px-4 py-2 rounded-lg text-gray-600 bg-gray-200 hover:bg-gray-300 font-semibold">Cancel</button>
                    <button type="button" onClick={addCustomSection} className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold">Add Section</button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col items-center pt-4">
              <button
                type="submit"
                disabled={generating}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {generating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating Paper with AI...
                  </div>
                ) : (
                  '🤖 Generate Fake Scientific Paper'
                )}
              </button>
              <p className="text-center text-sm text-gray-500 mt-4 max-w-md">
                {generating
                  ? 'Using Gemini AI to create a realistic but fabricated research paper...'
                  : 'This will create a plausible but fabricated scientific paper for educational analysis and fraud detection training'
                }
              </p>
            </div>
          </form>
        </div>

        {/* Generated Paper Preview */}
        {showPreview && generatedPaper && (
          <div className="mt-8 bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Generated Research Paper</h2>
              <div className="flex space-x-4">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  📄 Download PDF
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-300"
                >
                  🔄 Generate New Paper
                </button>
              </div>
            </div>

            {/* Paper Preview */}
            <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border">
              <div className="prose max-w-none">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                  {generatedPaper.title}
                </h1>

                <div className="text-center mb-8 text-gray-600">
                  <p className="italic">Dr. John A. Smith¹, Dr. Sarah B. Johnson², Dr. Michael C. Brown¹</p>
                  <p className="text-sm">¹Department of Research Studies, University of Academic Excellence</p>
                  <p className="text-sm">²Institute for Advanced Research, Global Research Center</p>
                </div>

                {generatedPaper.abstract && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Abstract</h2>
                    <p className="text-gray-700 text-justify">{generatedPaper.abstract}</p>
                  </div>
                )}

                {generatedPaper.introduction && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">1. Introduction</h2>
                    <p className="text-gray-700 text-justify">{generatedPaper.introduction}</p>
                  </div>
                )}

                {generatedPaper.literatureReview && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">2. Literature Review</h2>
                    <p className="text-gray-700 text-justify">{generatedPaper.literatureReview}</p>
                  </div>
                )}

                {generatedPaper.methodology && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">3. Methodology</h2>
                    <p className="text-gray-700 text-justify">{generatedPaper.methodology}</p>
                  </div>
                )}

                {generatedPaper.results && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">4. Results</h2>
                    <p className="text-gray-700 text-justify">{generatedPaper.results}</p>
                  </div>
                )}

                {generatedPaper.discussion && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">5. Discussion</h2>
                    <p className="text-gray-700 text-justify">{generatedPaper.discussion}</p>
                  </div>
                )}

                {/* Custom Sections */}
                {generatedPaper.customSections && Object.entries(generatedPaper.customSections).map(([sectionName, content], index) => (
                  <div key={sectionName} className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">{6 + index}. {sectionName}</h2>
                    <p className="text-gray-700 text-justify">{content}</p>
                  </div>
                ))}

                {generatedPaper.conclusion && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">
                      {Object.keys(generatedPaper.customSections || {}).length + 6}. Conclusion
                    </h2>
                    <p className="text-gray-700 text-justify">{generatedPaper.conclusion}</p>
                  </div>
                )}

                {generatedPaper.references && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">References</h2>
                    <div className="text-gray-700 text-sm">
                      {generatedPaper.references.split('\n').map((ref, index) => (
                        ref.trim() && (
                          <p key={index} className="mb-2 text-justify">
                            {index + 1}. {ref.trim()}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Notice */}
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>Educational Purpose Only:</strong> This is a fabricated research paper generated for educational purposes to help identify fake academic content. It contains intentionally fabricated data and should never be used for actual academic submission or citation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperFlowForm;