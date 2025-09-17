import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gsap } from 'gsap';
import PerformanceMonitor from './PerformanceMonitor';

const Profile = () => {
  const { user, getUserProfile, getUserPaperHistory, getUserVerificationHistory, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [paperHistory, setPaperHistory] = useState([]);
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Load profile data first (faster)
          const profileData = await getUserProfile();
          setProfile(profileData);
          setLoading(false); // Show profile immediately

          // Load history data separately (slower)
          setHistoryLoading(true);
          const [historyData, verificationData] = await Promise.all([
            getUserPaperHistory(20), // Limit to 20 recent papers
            getUserVerificationHistory(20) // Limit to 20 recent verifications
          ]);
          setPaperHistory(historyData);
          setVerificationHistory(verificationData);
          setHistoryLoading(false);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
          setHistoryLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user, getUserProfile, getUserPaperHistory, getUserVerificationHistory]);

  useEffect(() => {
    gsap.fromTo('.profile-content',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.2 }
    );
  }, [loading]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Profile Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2 w-48"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-64"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-6 w-40"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PerformanceMonitor componentName="Profile" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="profile-content bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {profile?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {profile?.firstName && profile?.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : user?.displayName || 'User'
                    }
                  </h1>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500">
                    Member since {formatDate(profile?.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-300"
              >
                Logout
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {profile?.papersGenerated || 0}
                </div>
                <div className="text-gray-600">Papers Generated</div>
              </div>
              <div className="bg-red-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {verificationHistory.length}
                </div>
                <div className="text-gray-600">Papers Verified</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {paperHistory.length + verificationHistory.length}
                </div>
                <div className="text-gray-600">Total Activities</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {profile?.institution ? '✓' : '✗'}
                </div>
                <div className="text-gray-600">Institution Set</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-content bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'profile'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'history'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Paper History ({paperHistory.length})
                </button>
                <button
                  onClick={() => setActiveTab('verifications')}
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'verifications'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Verification History ({verificationHistory.length})
                </button>
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                        {profile?.firstName || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                        {profile?.lastName || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                        {user?.email}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institution
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                        {profile?.institution || 'Not set'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Paper Generation History</h2>
                  {historyLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading paper history...</p>
                    </div>
                  ) : paperHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">📄</div>
                      <p className="text-lg mb-2">No papers generated yet</p>
                      <p className="text-sm">Start creating fake papers to see your history here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paperHistory.map((paper) => (
                        <div key={paper.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {paper.title}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {paper.sections?.map((section) => (
                                  <span
                                    key={section}
                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {section}
                                  </span>
                                ))}
                                {paper.customSections?.map((section) => (
                                  <span
                                    key={section.id || section.name}
                                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {section.name || section}
                                  </span>
                                ))}
                              </div>
                              <p className="text-sm text-gray-500">
                                Generated on {formatDate(paper.createdAt)}
                              </p>
                            </div>
                            <div className="ml-4">
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                {paper.status || 'Generated'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'verifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Paper Verification History</h2>
                  {historyLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading verification history...</p>
                    </div>
                  ) : verificationHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className="text-lg mb-2">No verifications performed yet</p>
                      <p className="text-sm">Start verifying papers to see your history here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {verificationHistory.map((verification) => (
                        <div key={verification.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="text-lg mr-2">
                                  {verification.isLikelyFake ? '🚨' : '✅'}
                                </span>
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {verification.fileName || 'Manual Input'}
                                </h3>
                              </div>

                              <div className="mb-3">
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${verification.isLikelyFake
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-green-100 text-green-800'
                                    }`}>
                                    {verification.isLikelyFake ? 'Likely Fake' : 'Appears Authentic'}
                                  </span>
                                  <span className="text-gray-600">
                                    {verification.fakeProbability}% fake probability
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${verification.confidence === 'High' ? 'bg-red-100 text-red-800' :
                                      verification.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                    {verification.confidence} Confidence
                                  </span>
                                </div>
                              </div>

                              <div className="mb-3">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {verification.text}...
                                </p>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  Verified on {formatDate(verification.createdAt)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {verification.detectedPatterns} issues detected
                                </span>
                              </div>
                            </div>

                            <div className="ml-4">
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {verification.status || 'Completed'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;