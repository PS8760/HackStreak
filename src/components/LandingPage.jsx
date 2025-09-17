import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../contexts/AuthContext';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const { user } = useAuth();
  const heroRef = useRef();
  const featuresRef = useRef();
  const statsRef = useRef();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo('.hero-title',
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.3 }
      );

      gsap.fromTo('.hero-subtitle',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.6 }
      );

      gsap.fromTo('.hero-buttons',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.9 }
      );

      // Features animation
      gsap.fromTo('.feature-card',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
          }
        }
      );

      // Stats animation
      gsap.fromTo('.stat-item',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: '📝',
      title: 'Paper Generation',
      description: 'Create fake scientific papers with customizable sections for educational analysis.'
    },
    {
      icon: '🔍',
      title: 'AI Detection Tool',
      description: 'Advanced verification system to identify AI-generated content in research papers.'
    },
    {
      icon: '⚠️',
      title: 'Pattern Analysis',
      description: 'Detect suspicious writing patterns, repetitive structures, and AI signatures.'
    },
    {
      icon: '📊',
      title: 'Style Analysis',
      description: 'Comprehensive analysis of writing style, complexity, and readability metrics.'
    },
    {
      icon: '🎯',
      title: 'Fraud Prevention',
      description: 'Learn to identify and prevent AI-generated academic fraud through practical training.'
    },
    {
      icon: '🛡️',
      title: 'Academic Integrity',
      description: 'Promote awareness and understanding of proper research practices and ethics.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Research Papers' },
    { number: '500+', label: 'Universities' },
    { number: '50+', label: 'Countries' },
    { number: '99%', label: 'Satisfaction' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="hero-title text-5xl md:text-7xl font-bold text-white mb-6">
            PaperFlow
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Generator
            </span>
          </h1>

          <p className="hero-subtitle text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Educational tool for generating fake scientific papers to help students and researchers learn to identify AI-generated academic fraud.
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link
                  to="/research-form"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  Generate Paper
                </Link>
                <Link
                  to="/verify-paper"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300"
                >
                  Verify Paper
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Educational Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn to identify and prevent AI-generated academic fraud through interactive education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Researchers Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-200 text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            {user ? 'Continue Your Research Journey' : 'Ready to Learn About Academic Fraud Detection?'}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {user
              ? 'Generate papers, verify authenticity, and enhance your fraud detection skills.'
              : 'Join educators and researchers in building awareness about AI-generated academic fraud.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link
                  to="/research-form"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Generate Paper
                </Link>
                <Link
                  to="/verify-paper"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Verify Paper
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Get Started Now
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;