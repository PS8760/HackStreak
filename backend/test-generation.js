import dotenv from 'dotenv';
import { generateResearchPaperContent } from './src/services/paperGenerationService.js';
import { generateResearchPaperPDF } from './src/utils/pdfGenerator.js';
import fs from 'fs';

// Load environment variables
dotenv.config();

async function testGeneration() {
  try {
    console.log('🧪 Testing paper generation...');
    
    const title = "The Impact of Artificial Intelligence on Academic Research Productivity";
    const sections = ['abstract', 'introduction', 'methodology', 'results', 'discussion', 'conclusion', 'references'];
    const customSections = [{ name: 'Future Implications' }];
    
    console.log('📝 Generating paper content...');
    const paperContent = await generateResearchPaperContent(title, sections, customSections);
    
    console.log('✅ Paper content generated successfully!');
    console.log('📊 Content summary:');
    console.log(`- Title: ${paperContent.title}`);
    console.log(`- Sections: ${Object.keys(paperContent).filter(k => k !== 'title' && k !== 'customSections' && k !== 'metadata').length}`);
    console.log(`- Custom sections: ${paperContent.customSections ? Object.keys(paperContent.customSections).length : 0}`);
    console.log(`- Total words: ${paperContent.metadata?.totalWords || 'Unknown'}`);
    
    // Test PDF generation
    console.log('📄 Generating PDF...');
    const pdfBuffer = generateResearchPaperPDF(paperContent, 'test-paper.pdf');
    
    // Save PDF to file for testing
    fs.writeFileSync('test-paper.pdf', Buffer.from(pdfBuffer));
    console.log('✅ PDF generated successfully! Saved as test-paper.pdf');
    
    // Show sample content
    console.log('\\n📖 Sample Abstract:');
    console.log(paperContent.abstract?.substring(0, 200) + '...');
    
    console.log('\\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testGeneration();