'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { app } from './firebase';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export interface AppUser {
  uid: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: 'ADMIN' | 'CO_ADMIN' | 'USER';
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function syncUserWithDB(firebaseUser: User): Promise<AppUser> {
  const idToken = await firebaseUser.getIdToken();
  const res = await fetch('/api/auth/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({
      firebaseId: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      image: firebaseUser.photoURL,
    }),
  });
  if (!res.ok) throw new Error('Failed to sync user');
  return res.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const appUser = await syncUserWithDB(fbUser);
          setUser(appUser);
          // Store token in cookie for SSR middleware
          const token = await fbUser.getIdToken();
          document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`;
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
        document.cookie = 'firebase-token=; path=/; max-age=0';
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    // Re-trigger sync with the display name
    await syncUserWithDB({ ...cred.user, displayName: name } as User);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
