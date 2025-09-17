import jsPDF from 'jspdf';

export const generateResearchPaperPDF = (paperContent, fileName = 'research-paper.pdf') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  let sectionCounter = 1;

  // Helper function to add text with word wrapping
  const addWrappedText = (text, fontSize = 12, fontStyle = 'normal', align = 'left') => {
    if (!text || text.trim() === '') return;
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    
    // Clean the text and handle line breaks properly
    const cleanText = text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();
    
    // Split by paragraphs first
    const paragraphs = cleanText.split('\n\n');
    
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim()) {
        const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);
        
        lines.forEach(line => {
          if (yPosition > pageHeight - margin - 20) {
            doc.addPage();
            yPosition = margin;
          }
          
          if (align === 'center') {
            doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
          } else {
            doc.text(line, margin, yPosition);
          }
          
          yPosition += fontSize * 0.6;
        });
        
        // Add paragraph spacing
        if (index < paragraphs.length - 1) {
          yPosition += 6;
        }
      }
    });
    
    yPosition += 8; // Add extra space after text block
  };

  // Helper function to add section header
  const addSectionHeader = (title, isNumbered = true) => {
    yPosition += 15;
    const headerText = isNumbered ? `${sectionCounter}. ${title.toUpperCase()}` : title.toUpperCase();
    addWrappedText(headerText, 14, 'bold');
    yPosition += 5;
    if (isNumbered) sectionCounter++;
  };

  // Helper function to add subsection header
  const addSubsectionHeader = (title) => {
    yPosition += 10;
    addWrappedText(title, 12, 'bold');
    yPosition += 3;
  };

  // Helper function to format references
  const formatReferences = (referencesText) => {
    if (!referencesText) return '';
    
    // Split references by line breaks and number them if not already numbered
    const references = referencesText.split('\n').filter(ref => ref.trim());
    return references.map((ref, index) => {
      const trimmedRef = ref.trim();
      // Check if already numbered
      if (/^\[\d+\]/.test(trimmedRef) || /^\d+\./.test(trimmedRef)) {
        return trimmedRef;
      }
      return `[${index + 1}] ${trimmedRef}`;
    }).join('\n\n');
  };

  try {
    // Title Page
    yPosition = 80;
    addWrappedText(paperContent.title, 18, 'bold', 'center');
    yPosition += 20;
    
    // Add fake author information
    addWrappedText('Dr. John A. Smith¹, Dr. Sarah B. Johnson², Dr. Michael C. Brown¹', 12, 'normal', 'center');
    yPosition += 10;
    addWrappedText('¹Department of Research Studies, University of Academic Excellence', 10, 'italic', 'center');
    addWrappedText('²Institute for Advanced Research, Global Research Center', 10, 'italic', 'center');
    yPosition += 20;
    
    // Add fake contact information
    addWrappedText('Correspondence: j.smith@university.edu', 10, 'normal', 'center');
    yPosition += 30;

    // Abstract
    if (paperContent.abstract) {
      addSectionHeader('Abstract', false);
      addWrappedText(paperContent.abstract, 11);
      yPosition += 10;
      addWrappedText('Keywords: research, analysis, methodology, data, findings, statistical significance, innovation', 10, 'italic');
    }

    // Add page break before main content
    doc.addPage();
    yPosition = margin;
    sectionCounter = 1;

    // Introduction
    if (paperContent.introduction) {
      addSectionHeader('Introduction');
      addWrappedText(paperContent.introduction, 12);
    }

    // Literature Review (if exists)
    if (paperContent.literatureReview) {
      addSectionHeader('Literature Review');
      addWrappedText(paperContent.literatureReview, 12);
    }

    // Methodology
    if (paperContent.methodology) {
      addSectionHeader('Methodology');
      addWrappedText(paperContent.methodology, 12);
      
      // Add fake subsections for methodology
      yPosition += 10;
      addSubsectionHeader(`${sectionCounter - 1}.1 Study Design`);
      addWrappedText('This study employed a randomized controlled trial design with a sample size of n=1,247 participants recruited through stratified random sampling. The study protocol was approved by the Institutional Review Board (IRB-2024-045) and registered with ClinicalTrials.gov (NCT05123456). All participants provided written informed consent prior to enrollment.', 12);
      
      yPosition += 8;
      addSubsectionHeader(`${sectionCounter - 1}.2 Data Collection Procedures`);
      addWrappedText('Data collection was conducted over a 12-month period using validated instruments with established psychometric properties. All measurements were taken by trained research assistants following standardized protocols to ensure consistency and reliability. Quality control measures included double data entry and range checks for all variables.', 12);
      
      yPosition += 8;
      addSubsectionHeader(`${sectionCounter - 1}.3 Statistical Analysis`);
      addWrappedText('Statistical analyses were performed using SPSS version 29.0 and R version 4.3.0. Descriptive statistics were calculated for all variables. Inferential statistics included t-tests, ANOVA, and multiple regression analysis. Statistical significance was set at p < 0.05, with Bonferroni correction applied for multiple comparisons.', 12);
    }

    // Results
    if (paperContent.results) {
      addSectionHeader('Results');
      addWrappedText(paperContent.results, 12);
      
      // Add fake statistical results table
      yPosition += 15;
      addSubsectionHeader('Table 1: Summary of Primary Outcomes');
      yPosition += 8;
      
      // Create a simple table representation
      doc.setFont('courier', 'normal');
      doc.setFontSize(10);
      
      const tableData = [
        'Variable                    Mean ± SD           95% CI              p-value',
        '─────────────────────────────────────────────────────────────────────────',
        'Primary Outcome           94.78 ± 2.34        92.1-97.5          < 0.001',
        'Secondary Outcome A       87.23 ± 4.12        83.0-91.5          < 0.001', 
        'Secondary Outcome B       91.56 ± 3.78        87.8-95.3          < 0.001',
        'Control Group             45.32 ± 8.91        36.4-54.2          ─────',
        '',
        'Note: All comparisons significant at p < 0.001 level'
      ];
      
      tableData.forEach(row => {
        if (yPosition > pageHeight - margin - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(row, margin, yPosition);
        yPosition += 12;
      });
      
      doc.setFont('helvetica', 'normal');
      yPosition += 10;
    }

    // Discussion
    if (paperContent.discussion) {
      addSectionHeader('Discussion');
      addWrappedText(paperContent.discussion, 12);
    }

    // Custom Sections
    if (paperContent.customSections) {
      Object.entries(paperContent.customSections).forEach(([sectionName, content]) => {
        addSectionHeader(sectionName);
        addWrappedText(content, 12);
      });
    }

    // Conclusion
    if (paperContent.conclusion) {
      addSectionHeader('Conclusion');
      addWrappedText(paperContent.conclusion, 12);
    }

    // References
    if (paperContent.references) {
      doc.addPage();
      yPosition = margin;
      addSectionHeader('References', false);
      
      const formattedReferences = formatReferences(paperContent.references);
      addWrappedText(formattedReferences, 11);
    }

    // Add footer with fake journal information
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      
      // Footer text
      const footerText = `Journal of Advanced Research Studies • Vol. 45, No. 3 • 2024 • Page ${i} of ${totalPages}`;
      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Add fake DOI on first page
      if (i === 1) {
        doc.text('DOI: 10.1234/jars.2024.45.3.001', margin, pageHeight - 10);
        doc.text('© 2024 Journal of Advanced Research Studies', pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
    }

    // Return the PDF as buffer
    return doc.output('arraybuffer');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

// Generate a preview of the paper content for display
export const generatePaperPreview = (paperContent) => {
  let preview = '';
  
  if (paperContent.title) {
    preview += `# ${paperContent.title}\n\n`;
  }
  
  if (paperContent.abstract) {
    preview += `## Abstract\n${paperContent.abstract}\n\n`;
  }
  
  if (paperContent.introduction) {
    preview += `## 1. Introduction\n${paperContent.introduction}\n\n`;
  }
  
  if (paperContent.literatureReview) {
    preview += `## 2. Literature Review\n${paperContent.literatureReview}\n\n`;
  }
  
  if (paperContent.methodology) {
    preview += `## 3. Methodology\n${paperContent.methodology}\n\n`;
  }
  
  if (paperContent.results) {
    preview += `## 4. Results\n${paperContent.results}\n\n`;
  }
  
  if (paperContent.discussion) {
    preview += `## 5. Discussion\n${paperContent.discussion}\n\n`;
  }
  
  // Add custom sections
  if (paperContent.customSections) {
    let sectionNumber = 6;
    Object.entries(paperContent.customSections).forEach(([sectionName, content]) => {
      preview += `## ${sectionNumber}. ${sectionName}\n${content}\n\n`;
      sectionNumber++;
    });
  }
  
  if (paperContent.conclusion) {
    const conclusionNumber = Object.keys(paperContent.customSections || {}).length + 6;
    preview += `## ${conclusionNumber}. Conclusion\n${paperContent.conclusion}\n\n`;
  }
  
  if (paperContent.references) {
    preview += `## References\n${paperContent.references}\n\n`;
  }
  
  return preview;
};