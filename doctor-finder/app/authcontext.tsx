'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { initializeApp, FirebaseApp, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let auth2: Auth;
let db2: Firestore;

const initializeFirebase = async () => {
    // initialize firebase app, auth, and db
    if (!app) {
        try {
            const response = await fetch('/api/firebase-config'); // fetch firebase config from api
            const firebaseConfig = await response.json(); // get firebase config
            
            // try to initialize app with config
            try {
                app = initializeApp(firebaseConfig);
            } catch (error: any) {
                if (error.code === 'app/duplicate-app') {
                    app = getApp(); // get the existing app instead of trying to initialize without config
                }
            }

            auth = getAuth(app); // get auth
            db = getFirestore(app); // get firestore
            auth2 = auth;   // DU copy so not mess up original 
            db2 = db;       // DU copy so not mess up original
        } catch (error) {
            console.error('Error initializing Firebase:', error);
        }
    }
};

const getFirebaseAuth = () => {
    if (!auth) {
        throw new Error('Firebase Auth has not been initialized');
    }
    return auth;
};

const getFirebaseDb = () => {
    if (!db) {
        throw new Error('Firebase DB has not been initialized');
    }
    return db;
};

// Du need auth2, db2 unchanged
export { app, db2, auth2, initializeFirebase, getFirebaseAuth as auth, getFirebaseDb as db };

export const clearUserCache = () => {
    localStorage.removeItem('userCache'); // remove user cache from local storage
    localStorage.removeItem('userLocation'); // remove user location from local storage
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // initialize firebase app, auth, and db
    useEffect(() => {
        const initAuth = async () => {
            await initializeFirebase();
            const auth = getFirebaseAuth();
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setUser(user); // set user to current user
                setLoading(false); // set loading to false
            });

            return () => unsubscribe(); // unsubscribe from auth state changes
        };

        initAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

    
        