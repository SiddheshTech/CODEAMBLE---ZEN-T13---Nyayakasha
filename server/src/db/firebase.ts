import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env.js';

let firestoreDb: any = null;
let isFirebaseInitialized = false;

export function initFirebase(): any {
  if (isFirebaseInitialized) return firestoreDb;

  try {
    const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      (admin as any).initializeApp({
        credential: (admin as any).credential?.cert(serviceAccount)
      });
      firestoreDb = (admin as any).firestore ? (admin as any).firestore() : null;
      isFirebaseInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized via service account file');
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      (admin as any).initializeApp({
        credential: (admin as any).credential?.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      firestoreDb = (admin as any).firestore ? (admin as any).firestore() : null;
      isFirebaseInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized via environment variables');
    } else {
      console.log('ℹ️  Firebase credentials not provided. Operating with high-performance local store fallback.');
    }
  } catch (err) {
    console.log('Firebase initialization info:', err);
  }

  return firestoreDb;
}

export function getFirestore(): any {
  if (!isFirebaseInitialized) {
    return initFirebase();
  }
  return firestoreDb;
}
