# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `paperflow-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click on it and toggle "Enable"
   - **Google**: Click on it, toggle "Enable", and add your project's domain

## 3. Create Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location closest to your users
5. Click "Done"

## 4. Get Firebase Configuration

1. Go to Project Settings (gear icon in left sidebar)
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>) to add a web app
4. Register your app with name: `PaperFlow`
5. Copy the Firebase configuration object

## 5. Update Firebase Config

Replace the placeholder values in `src/firebase/config.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## 6. Set up Firestore Security Rules (Optional for Development)

In Firestore Database > Rules, you can use these rules for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own papers
    match /papers/{paperId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 7. Test the Application

1. Start your development server: `npm run dev`
2. Try registering a new account
3. Try logging in with email/password
4. Try Google sign-in
5. Generate a paper and check if it saves to your profile history

## Features Implemented

### Authentication
- ✅ Email/Password registration and login
- ✅ Google OAuth sign-in
- ✅ User profile management
- ✅ Automatic redirect after login
- ✅ Form validation and error handling

### User Profile
- ✅ Profile information display
- ✅ Paper generation history
- ✅ Statistics (papers generated, total history)
- ✅ Logout functionality

### Dynamic Navbar
- ✅ Shows login button when not authenticated
- ✅ Shows user profile dropdown when authenticated
- ✅ Profile access and logout options
- ✅ Mobile-responsive design

### Paper History
- ✅ Saves generated papers to Firestore
- ✅ Displays user's paper generation history
- ✅ Shows both standard and custom sections
- ✅ Timestamps for each generated paper

## Troubleshooting

### Common Issues

1. **Firebase config errors**: Make sure all config values are correct
2. **Authentication not working**: Check if Email/Password and Google providers are enabled
3. **Firestore permission errors**: Ensure security rules allow authenticated users to read/write their data
4. **Google sign-in issues**: Make sure your domain is added to authorized domains in Firebase Auth settings

### Development vs Production

- For development, you can use test mode for Firestore
- For production, implement proper security rules
- Add your production domain to Firebase Auth authorized domains
- Consider implementing additional security measures