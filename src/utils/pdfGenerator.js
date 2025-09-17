import jsPDF from 'jspdf';

export const generateResearchPaperPDF = (paperContent, fileName = 'research-paper.pdf') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addWrappedText = (text, fontSize = 12, fontStyle = 'normal', align = 'left') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    
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
      
      yPosition += fontSize * 0.6; // Better line spacing
    });
    
    yPosition += 8; // Add extra space after text block
  };

  // Helper function to add section header
  const addSectionHeader = (title) => {
    yPosition += 10;
    addWrappedText(title.toUpperCase(), 14, 'bold');
    yPosition += 5;
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
      addSectionHeader('Abstract');
      addWrappedText(paperContent.abstract, 11);
      yPosition += 10;
      addWrappedText('Keywords: research, analysis, methodology, data, findings', 10, 'italic');
    }

    // Add page break before main content
    doc.addPage();
    yPosition = margin;

    // Introduction
    if (paperContent.introduction) {
      addSectionHeader('1. Introduction');
      addWrappedText(paperContent.introduction, 12);
    }

    // Literature Review (if exists)
    if (paperContent.literatureReview) {
      addSectionHeader('2. Literature Review');
      addWrappedText(paperContent.literatureReview, 12);
    }

    // Methodology
    if (paperContent.methodology) {
      addSectionHeader('3. Methodology');
      addWrappedText(paperContent.methodology, 12);
      
      // Add fake subsections for methodology
      yPosition += 5;
      addWrappedText('3.1 Study Design', 12, 'bold');
      addWrappedText('This study employed a randomized controlled trial design with a sample size of n=1,247 participants. The study protocol was approved by the Institutional Review Board (IRB-2023-045).', 12);
      
      yPosition += 5;
      addWrappedText('3.2 Data Collection', 12, 'bold');
      addWrappedText('Data was collected using validated instruments over a 12-month period. All measurements were taken by trained research assistants following standardized protocols.', 12);
    }

    // Results
    if (paperContent.results) {
      addSectionHeader('4. Results');
      addWrappedText(paperContent.results, 12);
      
      // Add fake statistical results
      yPosition += 10;
      addWrappedText('Table 1: Summary of Primary Outcomes', 12, 'bold', 'center');
      yPosition += 5;
      
      // Simple table representation
      const tableData = [
        'Variable                    Mean ± SD           p-value',
        '─────────────────────────────────────────────────────',
        'Primary Outcome           94.7 ± 2.3          < 0.001',
        'Secondary Outcome A       87.2 ± 4.1          < 0.001', 
        'Secondary Outcome B       91.5 ± 3.7          < 0.001',
        'Control Group             45.3 ± 8.9          ─────'
      ];
      
      tableData.forEach(row => {
        doc.setFont('courier', 'normal');
        doc.setFontSize(10);
        doc.text(row, margin, yPosition);
        yPosition += 12;
      });
      
      doc.setFont('helvetica', 'normal');
    }

    // Discussion
    if (paperContent.discussion) {
      addSectionHeader('5. Discussion');
      addWrappedText(paperContent.discussion, 12);
    }

    // Custom Sections
    if (paperContent.customSections) {
      let sectionNumber = 6;
      Object.entries(paperContent.customSections).forEach(([sectionName, content]) => {
        addSectionHeader(`${sectionNumber}. ${sectionName}`);
        addWrappedText(content, 12);
        sectionNumber++;
      });
    }

    // Conclusion
    if (paperContent.conclusion) {
      addSectionHeader(`${Object.keys(paperContent.customSections || {}).length + 6}. Conclusion`);
      addWrappedText(paperContent.conclusion, 12);
    }

    // References
    if (paperContent.references) {
      doc.addPage();
      yPosition = margin;
      addSectionHeader('References');
      
      // Format references properly
      const references = paperContent.references.split('\n').filter(ref => ref.trim());
      references.forEach((ref, index) => {
        if (ref.trim()) {
          addWrappedText(`${index + 1}. ${ref.trim()}`, 11);
        }
      });
    }

    // Add footer with fake journal information
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      
      // Footer text
      const footerText = `Journal of Advanced Research Studies • Vol. 45, No. 3 • 2024 • Page ${i}`;
      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Add fake DOI
      if (i === 1) {
        doc.text('DOI: 10.1234/jars.2024.45.3.001', margin, pageHeight - 10);
      }
    }

    // Save the PDF
    doc.save(fileName);
    
    return true;
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
    preview += `## Introduction\n${paperContent.introduction}\n\n`;
  }
  
  if (paperContent.methodology) {
    preview += `## Methodology\n${paperContent.methodology}\n\n`;
  }
  
  if (paperContent.results) {
    preview += `## Results\n${paperContent.results}\n\n`;
  }
  
  if (paperContent.discussion) {
    preview += `## Discussion\n${paperContent.discussion}\n\n`;
  }
  
  // Add custom sections
  if (paperContent.customSections) {
    Object.entries(paperContent.customSections).forEach(([sectionName, content]) => {
      preview += `## ${sectionName}\n${content}\n\n`;
    });
  }
  
  if (paperContent.conclusion) {
    preview += `## Conclusion\n${paperContent.conclusion}\n\n`;
  }
  
  if (paperContent.references) {
    preview += `## References\n${paperContent.references}\n\n`;
  }
  
  return preview;
};