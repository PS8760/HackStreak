import { useEffect } from 'react';
import { gsap } from 'gsap';

const About = () => {
  useEffect(() => {
    gsap.fromTo('.about-content',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.2 }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="about-content text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">About PaperFlow</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering researchers worldwide with intelligent tools for creating comprehensive and well-structured research papers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="about-content">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6">
              We believe that every researcher deserves access to powerful, intuitive tools that streamline the research paper creation process. Our platform combines cutting-edge technology with academic best practices to help you focus on what matters most - your research.
            </p>
            <p className="text-lg text-gray-600">
              From initial concept to final publication, we provide the structure, guidance, and tools you need to create impactful research papers that contribute meaningfully to your field.
            </p>
          </div>
          <div className="about-content">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Us?</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3">✓</span>
                  <span className="text-gray-600">Intelligent form-based paper structure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3">✓</span>
                  <span className="text-gray-600">Comprehensive methodology guidance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3">✓</span>
                  <span className="text-gray-600">Seamless data integration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3">✓</span>
                  <span className="text-gray-600">Collaborative research environment</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="about-content bg-white rounded-2xl shadow-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Join Our Community</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with researchers from around the world, share insights, and collaborate on groundbreaking research projects.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;