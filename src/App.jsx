import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import PaperFlowForm from './components/PaperFlowForm';
import PaperVerifier from './components/PaperVerifier';
import LoginRegister from './components/LoginRegister';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import About from './components/About';
import Contact from './components/Contact';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/research-form" element={
                <ProtectedRoute>
                  <PaperFlowForm />
                </ProtectedRoute>
              } />
              <Route path="/verify-paper" element={
                <ProtectedRoute>
                  <PaperVerifier />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginRegister />} />
              <Route path="/register" element={<LoginRegister />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              {/* Placeholder routes for footer links */}
              <Route path="/templates" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">Templates - Coming Soon</h1></div>} />
              <Route path="/features" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">Features - Coming Soon</h1></div>} />
              <Route path="/pricing" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">Pricing - Coming Soon</h1></div>} />
              <Route path="/careers" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">Careers - Coming Soon</h1></div>} />
              <Route path="/blog" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">Blog - Coming Soon</h1></div>} />
              <Route path="/help" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">Help Center - Coming Soon</h1></div>} />
              <Route path="/docs" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">Documentation - Coming Soon</h1></div>} />
              <Route path="/api" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">API Reference - Coming Soon</h1></div>} />
              <Route path="/community" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">Community - Coming Soon</h1></div>} />
              <Route path="/privacy" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">Privacy Policy - Coming Soon</h1></div>} />
              <Route path="/terms" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">Terms of Service - Coming Soon</h1></div>} />
              <Route path="/cookies" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">Cookie Policy - Coming Soon</h1></div>} />
              <Route path="/gdpr" element={<div className="min-h-screen pt-20 flex items-center justify-center"><h1 className="text-4xl font-bold text-gray-800">GDPR - Coming Soon</h1></div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;