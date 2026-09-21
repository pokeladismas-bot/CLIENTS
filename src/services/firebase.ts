import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut as fbSignOut, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocFromServer,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AuthSession } from '../types';

// Initialize Firebase App singleton
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(firebaseApp);

// Initialize Firestore with specific Database ID
export const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Test connection on boot per Firebase skill guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline. Operating with local cache.');
    }
    // Return true or false gracefully
    return false;
  }
}

// Sign in with Google (Firebase Auth)
export async function signInWithGoogleAuth(): Promise<{ user: User; session: AuthSession } | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if the user is the admin
    const isAdmin = user.email?.toLowerCase() === 'dismaspokela@gmail.com';
    
    const session: AuthSession = {
      role: isAdmin ? 'admin' : 'patient',
      username: user.email || user.displayName || 'Google User',
      name: user.displayName || user.email || 'Mtumiaji wa Google',
      loginTime: new Date().toISOString(),
      canPrintReports: true,
    };

    // Save/update user session in firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: session.role,
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.warn('Could not sync user profile to firestore:', err);
    }

    return { user, session };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

// Sign out from Firebase
export async function signOutFirebase(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Firebase Sign-Out Error:', error);
  }
}
