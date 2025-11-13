/**
 * Browser Fingerprinting Utilities
 *
 * EDUCATIONAL PURPOSE:
 * These functions demonstrate various browser fingerprinting techniques
 * used by trackers and malicious websites. Understanding these methods
 * helps users protect their privacy.
 *
 * Techniques demonstrated:
 * - Canvas fingerprinting
 * - WebGL fingerprinting
 * - Audio fingerprinting
 * - Font detection
 * - WebRTC IP leak detection
 */

/**
 * Generate Canvas Fingerprint
 * Canvas fingerprinting exploits subtle differences in how browsers render graphics
 * @returns {string} Hash of canvas data
 */
export function canvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Draw text with specific styling
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.font = '11pt Arial';
    ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 2, 15);

    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18pt Arial';
    ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 4, 45);

    // Get canvas data
    const dataURL = canvas.toDataURL();

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < dataURL.length; i++) {
      const char = dataURL.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return hash.toString(16);
  } catch (e) {
    return 'unavailable';
  }
}

/**
 * Generate WebGL Fingerprint
 * WebGL fingerprinting uses graphics card and driver information
 * @returns {Object} WebGL information
 */
export function webglFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      return { renderer: 'unavailable', vendor: 'unavailable' };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    return {
      renderer: debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : 'unavailable',
      vendor: debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : 'unavailable',
    };
  } catch (e) {
    return { renderer: 'unavailable', vendor: 'unavailable' };
  }
}

/**
 * Generate Audio Fingerprint
 * Audio context fingerprinting uses audio processing differences
 * @returns {Promise<string>} Hash of audio data
 */
export async function audioFingerprint() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return 'unavailable';
    }

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

    gainNode.gain.value = 0; // Mute
    oscillator.type = 'triangle';
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(context.destination);

    return new Promise((resolve) => {
      scriptProcessor.onaudioprocess = function (event) {
        const output = event.outputBuffer.getChannelData(0);
        let hash = 0;

        for (let i = 0; i < output.length; i++) {
          hash += Math.abs(output[i]);
        }

        oscillator.stop();
        scriptProcessor.disconnect();
        context.close();

        resolve(hash.toString(16).slice(0, 16));
      };

      oscillator.start(0);
    });
  } catch (e) {
    return 'unavailable';
  }
}

/**
 * Detect installed fonts
 * Font detection reveals system configuration
 * @returns {Array<string>} List of detected fonts
 */
export function getFonts() {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';
  const h = document.getElementsByTagName('body')[0];

  const s = document.createElement('span');
  s.style.fontSize = testSize;
  s.innerHTML = testString;
  const defaultWidth = {};
  const defaultHeight = {};

  // Get default dimensions
  for (const baseFont of baseFonts) {
    s.style.fontFamily = baseFont;
    h.appendChild(s);
    defaultWidth[baseFont] = s.offsetWidth;
    defaultHeight[baseFont] = s.offsetHeight;
    h.removeChild(s);
  }

  // Test fonts
  const fontList = [
    'Arial', 'Arial Black', 'Comic Sans MS', 'Courier', 'Courier New',
    'Georgia', 'Helvetica', 'Impact', 'Times', 'Times New Roman',
    'Trebuchet MS', 'Verdana', 'Monaco', 'Lucida Console'
  ];

  const detected = [];

  for (const font of fontList) {
    let detected_flag = false;

    for (const baseFont of baseFonts) {
      s.style.fontFamily = `'${font}',${baseFont}`;
      h.appendChild(s);

      const matched = s.offsetWidth !== defaultWidth[baseFont] ||
                     s.offsetHeight !== defaultHeight[baseFont];

      h.removeChild(s);

      if (matched) {
        detected_flag = true;
        break;
      }
    }

    if (detected_flag) {
      detected.push(font);
    }
  }

  return detected;
}

/**
 * Get WebRTC IPs (demonstrates IP leak)
 * WebRTC can reveal real IP even when using VPN
 * @returns {Promise<Object>} Public and local IPs
 */
export async function getWebRTCIPs() {
  return new Promise((resolve) => {
    const ips = { publicIP: null, localIPs: [] };
    const RTCPeerConnection =
      window.RTCPeerConnection ||
      window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection;

    if (!RTCPeerConnection) {
      resolve({ ...ips, detected: false });
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.createDataChannel('');
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => {});

    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) {
        resolve({ ...ips, detected: true });
        pc.close();
        return;
      }

      const parts = ice.candidate.candidate.split(' ');
      const ip = parts[4];
      const type = parts[7];

      if (ip && type) {
        if (type === 'host') {
          ips.localIPs.push(ip);
        } else if (type === 'srflx') {
          ips.publicIP = ip;
        }
      }
    };

    // Timeout after 2 seconds
    setTimeout(() => {
      resolve({ ...ips, detected: true });
      pc.close();
    }, 2000);
  });
}

/**
 * Get comprehensive screen information
 * @returns {Object} Screen details
 */
export function getScreenInfo() {
  return {
    resolution: `${window.screen.width}x${window.screen.height}`,
    availableResolution: `${window.screen.availWidth}x${window.screen.availHeight}`,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
  };
}

/**
 * Get browser information
 * @returns {Object} Browser details
 */
export function getBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages ? [...navigator.languages] : [navigator.language],
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || 'unspecified',
    onlineStatus: navigator.onLine,
    platform: navigator.platform,
    vendor: navigator.vendor,
  };
}

/**
 * Get device information
 * @returns {Object} Device details
 */
export function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iP(hone|od|ad)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua);
  const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua);

  return {
    platform: navigator.platform,
    vendor: navigator.vendor,
    cpuCores: navigator.hardwareConcurrency || 'unknown',
    memory: navigator.deviceMemory || 'unknown',
    maxTouchPoints: navigator.maxTouchPoints || 0,
    type: isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop',
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
  };
}

/**
 * Get timezone information
 * @returns {Object} Timezone details
 */
export function getTimezoneInfo() {
  const offset = new Date().getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offset / 60));
  const offsetMinutes = Math.abs(offset % 60);
  const sign = offset <= 0 ? '+' : '-';

  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: -offset, // Invert for standard format
    offsetString: `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`,
  };
}

/**
 * Get battery information (if available)
 * @returns {Promise<Object>} Battery details
 */
export async function getBatteryInfo() {
  try {
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      };
    }
  } catch (e) {
    // Battery API not available
  }
  return null;
}

/**
 * Get geolocation (requires user permission)
 * @returns {Promise<Object>} Geolocation data
 */
export async function getGeolocation() {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        });
      },
      () => {
        resolve(null); // User denied permission
      },
      { timeout: 1000, maximumAge: 0 }
    );
  });
}

/**
 * Collect all fingerprint data
 * @returns {Promise<Object>} Complete fingerprint data
 */
export async function collectFingerprint() {
  try {
    // Collect async data with individual error handling
    const [audio, webrtc, geolocation, battery] = await Promise.allSettled([
      audioFingerprint().catch(() => 'unavailable'),
      getWebRTCIPs().catch(() => ({ detected: false, publicIP: null, localIPs: [] })),
      getGeolocation().catch(() => null),
      getBatteryInfo().catch(() => null),
    ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : null));

    // Collect sync data with error handling
    let canvas = 'unavailable';
    let webgl = { renderer: 'unavailable', vendor: 'unavailable' };
    let fonts = [];

    try { canvas = canvasFingerprint(); } catch (e) { console.warn('Canvas fingerprint failed:', e); }
    try { webgl = webglFingerprint(); } catch (e) { console.warn('WebGL fingerprint failed:', e); }
    try { fonts = getFonts(); } catch (e) { console.warn('Font detection failed:', e); }

    return {
      screen: getScreenInfo(),
      browser: getBrowserInfo(),
      device: getDeviceInfo(),
      timezoneInfo: getTimezoneInfo(),
      fingerprints: {
        canvas,
        webgl,
        audio,
        fonts,
      },
      geolocation,
      webRTC: webrtc,
      battery,
    };
  } catch (error) {
    console.error('Error in collectFingerprint:', error);
    // Return minimal data if everything fails
    return {
      screen: { resolution: 'unknown' },
      browser: { userAgent: navigator.userAgent },
      device: { type: 'Unknown' },
      timezoneInfo: { timezone: 'UTC', offset: 0 },
      fingerprints: { canvas: 'error', webgl: { renderer: 'error' }, audio: 'error', fonts: [] },
      geolocation: null,
      webRTC: { detected: false },
      battery: null,
    };
  }
}

/**
 * Safe vibration function for mobile devices
 * @param {Array|number} pattern - Vibration pattern
 */
export function safeVibrate(pattern) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
