import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileCache, setProfileCache] = useState(null);
  const [historyCache, setHistoryCache] = useState(null);

  // Sign up with email and password
  const signup = async (email, password, firstName, lastName, institution) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's display name
      await updateProfile(result.user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        firstName,
        lastName,
        email,
        institution: institution || '',
        createdAt: new Date(),
        papersGenerated: 0
      });

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Sign in with email and password
  const signin = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Check if user document exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        const names = result.user.displayName?.split(' ') || ['', ''];
        await setDoc(doc(db, 'users', result.user.uid), {
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
          email: result.user.email,
          institution: '',
          createdAt: new Date(),
          papersGenerated: 0
        });
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      // Clear cache on logout
      setProfileCache(null);
      setHistoryCache(null);
    } catch (error) {
      throw error;
    }
  };

  // Save paper verification to history
  const saveVerificationToHistory = async (verificationData) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'verifications'), {
        userId: user.uid,
        text: verificationData.text.substring(0, 500), // Store first 500 chars
        fakeProbability: verificationData.fakeProbability,
        isLikelyFake: verificationData.isLikelyFake,
        confidence: verificationData.confidence,
        detectedPatterns: verificationData.detectedPatterns?.length || 0,
        fileName: verificationData.fileName || 'Manual Input',
        createdAt: new Date(),
        status: 'completed'
      });

      // Invalidate history cache to force refresh
      setHistoryCache(null);
    } catch (error) {
      console.error('Error saving verification to history:', error);
      throw error;
    }
  };

  // Save paper generation to history
  const savePaperToHistory = async (paperData) => {
    if (!user) return;

    try {
      // Add to papers collection
      const newPaper = {
        userId: user.uid,
        title: paperData.title,
        sections: paperData.sections,
        customSections: paperData.customSections || [],
        createdAt: new Date(),
        status: 'generated'
      };

      const docRef = await addDoc(collection(db, 'papers'), newPaper);

      // Update user's paper count
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentCount = userDoc.data().papersGenerated || 0;
        const updatedProfile = { ...userDoc.data(), papersGenerated: currentCount + 1 };
        await setDoc(userRef, updatedProfile, { merge: true });

        // Update profile cache
        setProfileCache(updatedProfile);
      }

      // Invalidate history cache to force refresh
      setHistoryCache(null);
    } catch (error) {
      console.error('Error saving paper to history:', error);
      throw error;
    }
  };

  // Get user's paper history with limit and caching for better performance
  const getUserPaperHistory = async (limitCount = 50, forceRefresh = false) => {
    if (!user) return [];

    // Return cached data if available and not forcing refresh
    if (historyCache && !forceRefresh && historyCache.length <= limitCount) {
      return historyCache.slice(0, limitCount);
    }

    try {
      const q = query(
        collection(db, 'papers'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const papers = [];
      querySnapshot.forEach((doc) => {
        papers.push({ id: doc.id, ...doc.data() });
      });

      setHistoryCache(papers);
      return papers;
    } catch (error) {
      console.error('Error fetching paper history:', error);
      return [];
    }
  };

  // Get user's verification history
  const getUserVerificationHistory = async (limitCount = 50) => {
    if (!user) return [];

    try {
      const q = query(
        collection(db, 'verifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const verifications = [];
      querySnapshot.forEach((doc) => {
        verifications.push({ id: doc.id, ...doc.data() });
      });

      return verifications;
    } catch (error) {
      console.error('Error fetching verification history:', error);
      return [];
    }
  };

  // Get user profile data with caching
  const getUserProfile = async (forceRefresh = false) => {
    if (!user) return null;

    // Return cached data if available and not forcing refresh
    if (profileCache && !forceRefresh) {
      return profileCache;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setProfileCache(profileData);
        return profileData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    signup,
    signin,
    signInWithGoogle,
    logout,
    savePaperToHistory,
    saveVerificationToHistory,
    getUserPaperHistory,
    getUserVerificationHistory,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};