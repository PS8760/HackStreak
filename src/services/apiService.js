const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Generate fake research paper
  async generatePaper(title, sections, customSections = []) {
    return this.request('/papers/generate', {
      method: 'POST',
      body: JSON.stringify({
        title,
        sections,
        customSections
      })
    });
  }

  // Generate individual section (for progressive loading)
  async generateSection(title, sectionName, existingContent = {}) {
    return this.request('/papers/generate-section', {
      method: 'POST',
      body: JSON.stringify({
        title,
        sectionName,
        existingContent
      })
    });
  }

  // Preview paper content
  async previewPaper(paperContent) {
    return this.request('/papers/preview', {
      method: 'POST',
      body: JSON.stringify({
        paperContent
      })
    });
  }

  // Generate and download PDF
  async generatePaperPDF(paperContent, fileName) {
    const url = `${this.baseURL}/papers/generate-pdf`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paperContent,
          fileName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'research-paper.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: 'PDF downloaded successfully' };
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw error;
    }
  }

  // Verify paper authenticity (text input)
  async verifyPaper(text, fileName = null) {
    return this.request('/papers/verify', {
      method: 'POST',
      body: JSON.stringify({
        text,
        fileName
      })
    });
  }

  // Verify paper authenticity (PDF upload)
  async verifyPaperPDF(file) {
    const url = `${this.baseURL}/papers/verify-pdf`;
    
    try {
      const formData = new FormData();
      formData.append('pdfFile', file);

      const response = await fetch(url, {
        method: 'POST',
        body: formData
        // Don't set Content-Type header - let browser set it with boundary
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('PDF verification failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request('/papers/health');
  }
}

export default new ApiService();