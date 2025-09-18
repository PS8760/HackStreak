const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses (like PDF downloads)
        data = await response.blob();
      }

      if (!response.ok) {
        const errorMessage = typeof data === 'object' && data.message 
          ? data.message 
          : `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return typeof data === 'object' && data.success !== undefined ? data : { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to backend server. Please ensure the Python backend is running on port 8000.');
      }
      
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
        custom_sections: customSections  // Backend expects snake_case
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
      console.log('Generating PDF for:', paperContent.title);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paper_content: paperContent,  // Python backend expects snake_case
          file_name: fileName
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate PDF';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Received empty PDF file');
      }
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'research-paper.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log('PDF downloaded successfully');
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
        file_name: fileName  // Backend expects snake_case
      })
    });
  }

  // Verify paper authenticity (PDF upload)
  async verifyPaperPDF(file) {
    const url = `${this.baseURL}/papers/verify-pdf`;
    
    try {
      console.log('Uploading PDF for verification:', file.name);
      
      const formData = new FormData();
      formData.append('pdf_file', file);  // Python backend expects pdf_file

      const response = await fetch(url, {
        method: 'POST',
        body: formData
        // Don't set Content-Type header - let browser set it with boundary
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || `HTTP error! status: ${response.status}`);
      }

      console.log('PDF verification completed');
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