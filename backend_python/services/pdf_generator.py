from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from io import BytesIO
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class PDFGeneratorService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Only add styles if they don't exist
        style_definitions = [
            ('CustomTitle', {
                'parent': self.styles['Title'],
                'fontSize': 18,
                'spaceAfter': 30,
                'alignment': TA_CENTER,
                'fontName': 'Helvetica-Bold'
            }),
            ('Author', {
                'parent': self.styles['Normal'],
                'fontSize': 12,
                'spaceAfter': 10,
                'alignment': TA_CENTER,
                'fontName': 'Helvetica'
            }),
            ('Affiliation', {
                'parent': self.styles['Normal'],
                'fontSize': 10,
                'spaceAfter': 5,
                'alignment': TA_CENTER,
                'fontName': 'Helvetica-Oblique'
            }),
            ('SectionHeader', {
                'parent': self.styles['Heading1'],
                'fontSize': 14,
                'spaceAfter': 12,
                'spaceBefore': 20,
                'fontName': 'Helvetica-Bold'
            }),
            ('SubsectionHeader', {
                'parent': self.styles['Heading2'],
                'fontSize': 12,
                'spaceAfter': 8,
                'spaceBefore': 12,
                'fontName': 'Helvetica-Bold'
            }),
            ('CustomBodyText', {  # Renamed to avoid conflict
                'parent': self.styles['Normal'],
                'fontSize': 11,
                'spaceAfter': 12,
                'alignment': TA_JUSTIFY,
                'fontName': 'Helvetica'
            }),
            ('CustomAbstract', {  # Renamed to avoid conflict
                'parent': self.styles['Normal'],
                'fontSize': 10,
                'spaceAfter': 12,
                'alignment': TA_JUSTIFY,
                'fontName': 'Helvetica',
                'leftIndent': 0.5*inch,
                'rightIndent': 0.5*inch
            }),
            ('CustomReference', {  # Renamed to avoid conflict
                'parent': self.styles['Normal'],
                'fontSize': 9,
                'spaceAfter': 6,
                'alignment': TA_LEFT,
                'fontName': 'Helvetica',
                'leftIndent': 0.2*inch,
                'firstLineIndent': -0.2*inch
            })
        ]
        
        for style_name, style_props in style_definitions:
            if style_name not in self.styles:
                self.styles.add(ParagraphStyle(name=style_name, **style_props))

    def generate_pdf(self, paper_content: Dict[str, Any], file_name: str = "research_paper.pdf") -> bytes:
        """Generate PDF from paper content"""
        try:
            logger.info(f"Generating PDF for: {paper_content.get('title', 'Unknown')}")
            
            # Create PDF buffer
            buffer = BytesIO()
            
            # Create document
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            
            # Build content
            story = []
            section_counter = 1
            
            # Title page
            story.extend(self._create_title_page(paper_content))
            
            # Abstract
            if paper_content.get('abstract'):
                story.append(PageBreak())
                story.extend(self._create_abstract_section(paper_content['abstract']))
            
            # Main content sections
            story.append(PageBreak())
            
            # Standard sections
            section_order = ['introduction', 'literatureReview', 'methodology', 'results', 'discussion']
            
            for section_name in section_order:
                if paper_content.get(section_name):
                    story.extend(self._create_section(
                        section_name, 
                        paper_content[section_name], 
                        section_counter
                    ))
                    section_counter += 1
            
            # Custom sections
            if paper_content.get('custom_sections'):
                for custom_name, custom_content in paper_content['custom_sections'].items():
                    story.extend(self._create_section(
                        custom_name, 
                        custom_content, 
                        section_counter,
                        is_custom=True
                    ))
                    section_counter += 1
            
            # Conclusion
            if paper_content.get('conclusion'):
                story.extend(self._create_section(
                    'conclusion', 
                    paper_content['conclusion'], 
                    section_counter
                ))
                section_counter += 1
            
            # References
            if paper_content.get('references'):
                story.append(PageBreak())
                story.extend(self._create_references_section(paper_content['references']))
            
            # Add methodology subsections if methodology exists
            if paper_content.get('methodology'):
                story.extend(self._add_methodology_subsections(section_counter - len(section_order)))
            
            # Add fake statistical table if results exist
            if paper_content.get('results'):
                story.extend(self._create_statistical_table())
            
            # Build PDF
            doc.build(story, onFirstPage=self._add_header_footer, onLaterPages=self._add_header_footer)
            
            # Get PDF bytes
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            logger.info(f"PDF generated successfully: {len(pdf_bytes)} bytes")
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            raise Exception(f"Failed to generate PDF: {str(e)}")

    def _create_title_page(self, paper_content: Dict[str, Any]) -> list:
        """Create title page elements"""
        elements = []
        
        # Add some space from top
        elements.append(Spacer(1, 2*inch))
        
        # Title
        title = paper_content.get('title', 'Research Paper Title')
        elements.append(Paragraph(title, self.styles['CustomTitle']))
        elements.append(Spacer(1, 0.5*inch))
        
        # Authors
        authors = "Dr. John A. Smith¹, Dr. Sarah B. Johnson², Dr. Michael C. Brown¹"
        elements.append(Paragraph(authors, self.styles['Author']))
        elements.append(Spacer(1, 0.2*inch))
        
        # Affiliations
        affiliation1 = "¹Department of Research Studies, University of Academic Excellence"
        affiliation2 = "²Institute for Advanced Research, Global Research Center"
        elements.append(Paragraph(affiliation1, self.styles['Affiliation']))
        elements.append(Paragraph(affiliation2, self.styles['Affiliation']))
        elements.append(Spacer(1, 0.5*inch))
        
        # Contact
        contact = "Correspondence: j.smith@university.edu"
        elements.append(Paragraph(contact, self.styles['Affiliation']))
        
        return elements

    def _create_abstract_section(self, abstract_text: str) -> list:
        """Create abstract section"""
        elements = []
        
        # Abstract header
        elements.append(Paragraph("ABSTRACT", self.styles['SectionHeader']))
        
        # Abstract content
        elements.append(Paragraph(abstract_text, self.styles['CustomAbstract']))
        elements.append(Spacer(1, 0.2*inch))
        
        # Keywords
        keywords = "Keywords: research, analysis, methodology, data, findings, statistical significance, innovation"
        elements.append(Paragraph(keywords, self.styles['Affiliation']))
        
        return elements

    def _create_section(self, section_name: str, content: str, section_number: int, is_custom: bool = False) -> list:
        """Create a standard section"""
        elements = []
        
        # Format section name
        formatted_name = self._format_section_name(section_name)
        
        # Section header
        if is_custom:
            header = f"{section_number}. {formatted_name}"
        else:
            header = f"{section_number}. {formatted_name}"
        
        elements.append(Paragraph(header, self.styles['SectionHeader']))
        
        # Section content
        # Split content into paragraphs
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        
        for paragraph in paragraphs:
            if paragraph:
                elements.append(Paragraph(paragraph, self.styles['CustomBodyText']))
        
        return elements

    def _create_references_section(self, references_text: str) -> list:
        """Create references section"""
        elements = []
        
        # References header
        elements.append(Paragraph("REFERENCES", self.styles['SectionHeader']))
        
        # Format references
        references = [ref.strip() for ref in references_text.split('\n') if ref.strip()]
        
        for i, ref in enumerate(references, 1):
            if ref and not ref.startswith('[') and not ref.startswith(f'{i}.'):
                ref = f"[{i}] {ref}"
            elements.append(Paragraph(ref, self.styles['CustomReference']))
        
        return elements

    def _add_methodology_subsections(self, methodology_section_num: int) -> list:
        """Add fake methodology subsections"""
        elements = []
        
        # Study Design subsection
        elements.append(Paragraph(f"{methodology_section_num}.1 Study Design", self.styles['SubsectionHeader']))
        study_design_text = ("This study employed a randomized controlled trial design with a sample size of "
                           "n=1,247 participants recruited through stratified random sampling. The study protocol "
                           "was approved by the Institutional Review Board (IRB-2024-045) and registered with "
                           "ClinicalTrials.gov (NCT05123456). All participants provided written informed consent "
                           "prior to enrollment.")
        elements.append(Paragraph(study_design_text, self.styles['BodyText']))
        
        # Data Collection subsection
        elements.append(Paragraph(f"{methodology_section_num}.2 Data Collection Procedures", self.styles['SubsectionHeader']))
        data_collection_text = ("Data collection was conducted over a 12-month period using validated instruments "
                              "with established psychometric properties. All measurements were taken by trained "
                              "research assistants following standardized protocols to ensure consistency and "
                              "reliability. Quality control measures included double data entry and range checks "
                              "for all variables.")
        elements.append(Paragraph(data_collection_text, self.styles['BodyText']))
        
        # Statistical Analysis subsection
        elements.append(Paragraph(f"{methodology_section_num}.3 Statistical Analysis", self.styles['SubsectionHeader']))
        stats_text = ("Statistical analyses were performed using SPSS version 29.0 and R version 4.3.0. "
                     "Descriptive statistics were calculated for all variables. Inferential statistics included "
                     "t-tests, ANOVA, and multiple regression analysis. Statistical significance was set at "
                     "p < 0.05, with Bonferroni correction applied for multiple comparisons.")
        elements.append(Paragraph(stats_text, self.styles['BodyText']))
        
        return elements

    def _create_statistical_table(self) -> list:
        """Create fake statistical results table"""
        elements = []
        
        elements.append(Spacer(1, 0.2*inch))
        elements.append(Paragraph("Table 1: Summary of Primary Outcomes", self.styles['SubsectionHeader']))
        elements.append(Spacer(1, 0.1*inch))
        
        # Table data
        data = [
            ['Variable', 'Mean ± SD', '95% CI', 'p-value'],
            ['Primary Outcome', '94.78 ± 2.34', '92.1-97.5', '< 0.001'],
            ['Secondary Outcome A', '87.23 ± 4.12', '83.0-91.5', '< 0.001'],
            ['Secondary Outcome B', '91.56 ± 3.78', '87.8-95.3', '< 0.001'],
            ['Control Group', '45.32 ± 8.91', '36.4-54.2', '—']
        ]
        
        # Create table
        table = Table(data, colWidths=[2*inch, 1.5*inch, 1.2*inch, 1*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.1*inch))
        
        # Table note
        note = "Note: All comparisons significant at p < 0.001 level"
        elements.append(Paragraph(note, self.styles['Affiliation']))
        
        return elements

    def _format_section_name(self, section_name: str) -> str:
        """Format section name for display"""
        name_mapping = {
            'introduction': 'Introduction',
            'literatureReview': 'Literature Review',
            'methodology': 'Methodology',
            'results': 'Results',
            'discussion': 'Discussion',
            'conclusion': 'Conclusion',
            'references': 'References',
            'appendices': 'Appendices'
        }
        
        return name_mapping.get(section_name, section_name.title())

    def _add_header_footer(self, canvas, doc):
        """Add header and footer to pages"""
        canvas.saveState()
        
        # Footer
        footer_text = f"Journal of Advanced Research Studies • Vol. 45, No. 3 • 2024 • Page {doc.page}"
        canvas.setFont('Helvetica-Oblique', 8)
        canvas.drawCentredText(letter[0]/2, 0.5*inch, footer_text)
        
        # Add DOI on first page
        if doc.page == 1:
            canvas.drawString(72, 0.5*inch, "DOI: 10.1234/jars.2024.45.3.001")
            canvas.drawRightString(letter[0]-72, 0.5*inch, "© 2024 Journal of Advanced Research Studies")
        
        canvas.restoreState()