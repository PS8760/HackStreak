# PaperFlow - Fake Research Paper Generator

🔬 **Educational tool for generating fake scientific papers to help identify AI-generated academic fraud.**

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Animations**: GSAP
- **PDF Processing**: PDF.js

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express
- **AI Integration**: Google Gemini 1.5 Flash
- **PDF Generation**: jsPDF
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Custom middleware
- **File Upload**: Multer for PDF processing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project (for authentication)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ResearchPaper
   ```

2. **Install all dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   
   **Frontend (.env)**
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
   
   **Backend (backend/.env)**
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   GEMINI_API_KEY=your_gemini_api_key
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Configure Firebase**
   - Create a Firebase project
   - Enable Authentication (Email/Password + Google)
   - Create Firestore database
   - Update `src/firebase/config.js` with your Firebase config

### Development

**Run full-stack development servers:**
```bash
npm run dev:fullstack
```

This starts:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

**Run individually:**
```bash
# Frontend only
npm run dev

# Backend only (from root directory)
npm run dev:backend

# Or from backend directory
cd backend
npm run dev
```

### Production Build

```bash
npm run build:fullstack
```

## 📁 Project Structure

```
ResearchPaper/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── PaperFlowForm.jsx   # Paper generation form
│   │   ├── PaperVerifier.jsx   # Paper verification tool
│   │   ├── Profile.jsx         # User profile & history
│   │   └── ...
│   ├── contexts/               # React contexts
│   ├── services/               # API services
│   │   └── apiService.js       # Backend API integration
│   └── firebase/               # Firebase configuration
├── backend/                     # Backend source
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── services/           # Business logic
│   │   │   ├── paperGenerationService.js
│   │   │   └── paperVerificationService.js
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── config/             # Configuration files
│   │   └── utils/              # Utility functions
│   │       ├── pdfGenerator.js # PDF creation
│   │       └── pdfProcessor.js # PDF parsing
│   └── package.json
└── package.json                # Frontend package.json
```

## 🔌 API Endpoints

### Paper Generation
- `POST /api/papers/generate` - Generate fake research paper
- `POST /api/papers/generate-pdf` - Generate and download PDF

### Paper Verification  
- `POST /api/papers/verify` - Verify paper authenticity (text input)
- `POST /api/papers/verify-pdf` - Verify paper authenticity (PDF upload)

### Health Check
- `GET /api/papers/health` - API health status

## 🎯 Features

### Paper Generation
- **AI-Powered Content**: Uses Google Gemini to generate realistic fake academic content
- **Multiple Sections**: Abstract, Introduction, Methodology, Results, Discussion, Conclusion, References
- **Custom Sections**: Add your own section types
- **Professional PDF**: Generate publication-ready PDFs with proper formatting
- **Suspicious Elements**: Intentionally includes detectable fraud indicators for training

### Paper Verification
- **Text Analysis**: Paste text directly for analysis
- **PDF Upload**: Upload PDF files for automatic text extraction and analysis
- **AI Detection**: Uses both local algorithms and AI to detect fake content
- **Comprehensive Reports**: Detailed analysis with confidence scores and recommendations
- **Red Flag Detection**: Identifies common patterns in AI-generated academic content

### Content Quality Features
- **Realistic Statistics**: Generates plausible but fabricated data
- **Academic Language**: Proper academic tone and structure
- **Citation Formatting**: Realistic but fake references
- **Suspicious Patterns**: Includes detectable red flags like:
  - Overly precise statistics (94.7832% accuracy)
  - Impossible results (100% success rates)
  - Vague citations ("personal communication")
  - Unrealistic timelines ("completed in 24 hours")

## 🧪 Testing

### Test Backend Generation
```bash
cd backend
node test-generation.js
```

This will:
- Generate a sample research paper
- Create a PDF file
- Display content statistics
- Verify all components work together

### Manual Testing
1. Start both frontend and backend
2. Navigate to http://localhost:5173
3. Create an account or sign in
4. Generate a fake paper with various sections
5. Download the PDF
6. Use the verification tool to analyze the generated content

## 🔧 Configuration

### Rate Limiting
- General API: 10 requests per 15 minutes
- PDF Generation: 5 requests per 15 minutes
- AI Analysis: 3 requests per minute

### File Upload Limits
- PDF files only
- Maximum size: 10MB
- Single file upload

### AI Configuration
The system uses Google Gemini 1.5 Flash with:
- Temperature: 0.7 (balanced creativity/consistency)
- Max tokens: 8192
- Safety settings enabled

## 🚨 Educational Purpose

**Important**: This tool is designed for educational purposes to help:
- Train researchers to identify AI-generated academic fraud
- Understand patterns in fake research papers
- Develop better detection methods
- Raise awareness about academic integrity

**Do not use generated content for actual academic submissions.**

## 🛠️ Development

### Adding New Features
1. Backend changes go in `backend/src/`
2. Frontend changes go in `src/`
3. Update API service in `src/services/apiService.js`
4. Add tests for new functionality

### Environment Setup
- Use Node.js 18+ for best compatibility
- Install dependencies with `npm install`
- Set up environment variables before running
- Configure Firebase for authentication

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the troubleshooting section below
2. Review the API documentation
3. Create an issue on GitHub

## 🔍 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if `.env` file exists in `backend/` directory
- Verify Gemini API key is valid
- Ensure port 5000 is available

**Frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Ensure CORS is properly configured

**PDF generation fails:**
- Check if content is properly formatted
- Verify jsPDF dependencies are installed
- Ensure sufficient memory for large documents

**AI generation fails:**
- Verify Gemini API key is valid and has quota
- Check internet connection
- Review API rate limits

### Performance Tips
- Use rate limiting to prevent API quota exhaustion
- Cache generated content when possible
- Optimize PDF generation for large documents
- Monitor memory usage during content generation