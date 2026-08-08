import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
let firestoreDb = null;
let isFirebaseInitialized = false;
export function initFirebase() {
    if (isFirebaseInitialized)
        return firestoreDb;
    try {
        const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
            if (getApps().length === 0) {
                initializeApp({
                    credential: cert(serviceAccount)
                });
            }
            firestoreDb = getAdminFirestore();
            firestoreDb.settings({ ignoreUndefinedProperties: true });
            isFirebaseInitialized = true;
            console.log('🔥 Firebase Admin SDK initialized via service account file (nyayakasha-1d94f)');
        }
        else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
            if (getApps().length === 0) {
                initializeApp({
                    credential: cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                    })
                });
            }
            firestoreDb = getAdminFirestore();
            firestoreDb.settings({ ignoreUndefinedProperties: true });
            isFirebaseInitialized = true;
            console.log('🔥 Firebase Admin SDK initialized via environment variables');
        }
        else {
            console.log('ℹ️  Firebase credentials not provided. Operating with high-performance local store fallback.');
        }
    }
    catch (err) {
        console.log('Firebase initialization info:', err.message || err);
    }
    return firestoreDb;
}
export function getFirestore() {
    if (!isFirebaseInitialized) {
        return initFirebase();
    }
    return firestoreDb;
}
