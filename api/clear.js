/**
 * Clear Database API Endpoint
 *
 * Deletes all victim records from database
 * Requires authentication
 *
 * DELETE /api/clear
 * Body: { password: "admin2024" }
 */

import { getSupabaseClient } from './_supabase.js';

/**
 * Main handler
 */
export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    const correctPassword = process.env.DASHBOARD_PASSWORD || 'admin2024';

    if (!password || password !== correctPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid password',
      });
    }

    const supabase = getSupabaseClient();

    // Delete all rows — Supabase requires a filter; use neq on id (always true)
    const { error, count } = await supabase
      .from('victims')
      .delete({ count: 'exact' })
      .neq('id', 0);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'All data cleared successfully',
      deletedCount: count ?? 0,
    });
  } catch (error) {
    console.error('Clear database error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
