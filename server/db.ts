import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { collection, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

neonConfig.webSocketConstructor = ws;

// Check if we're using in-memory storage for development
const useInMemory = process.env.NODE_ENV === 'development' && !process.env.USE_DATABASE;

if (!process.env.DATABASE_URL && !useInMemory) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a dummy DB setup for in-memory mode
let pool: Pool | null = null;
let db: any = null;

// Only set up real database if not using in-memory storage
if (!useInMemory && process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Define Firestore collections
const collections = {
  users: collection(firestore, 'users'),
  apiaries: collection(firestore, 'apiaries'),
  hives: collection(firestore, 'hives'),
  inventoryItems: collection(firestore, 'inventoryItems'),
  weatherData: collection(firestore, 'weatherData'),
  floraTypes: collection(firestore, 'floraTypes')
};

export { pool, db, collections, firestore };
