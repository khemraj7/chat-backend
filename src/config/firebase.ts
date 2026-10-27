import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from './env';

if (getApps().length === 0) {
  initializeApp({
    projectId: env.FIREBASE_PROJECT_ID,
    ...(env.FIRESTORE_EMULATOR_HOST ? {} : { credential: applicationDefault() }),
  });
}

export const db = getFirestore();