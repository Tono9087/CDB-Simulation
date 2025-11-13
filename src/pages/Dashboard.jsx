import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import VictimTable from '../components/VictimTable';
import LocationChart from '../components/Charts/LocationChart';
import TimelineChart from '../components/Charts/TimelineChart';
import DeviceChart from '../components/Charts/DeviceChart';
import { fetchStats, fetchVictims, clearDatabase, exportToCSV, downloadCSV } from '../utils/api';

/**
 * Dashboard Component
 *
 * Analytics dashboard for phishing simulation data
 * Protected with simple password authentication
 */
const Dashboard = () => {
  const navigate = useNavigate();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Data state
  const [stats, setStats] = useState(null);
  const [victims, setVictims] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState(null);

  // Handle authentication
  const handleAuth = (e) => {
    e.preventDefault();
    const correctPassword = 'admin2024'; // In production, this should be env variable

    if (password === correctPassword) {
      setIsAuthenticated(true);
      setAuthError('');
      loadDashboardData();
    } else {
      setAuthError('Invalid password');
    }
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    console.log('🔄 [DASHBOARD] Loading dashboard data...');

    try {
      const [statsData, victimsData] = await Promise.all([
        fetchStats(),
        fetchVictims(currentPage, 20),
      ]);

      console.log('✅ [DASHBOARD] Stats loaded:', statsData);
      console.log('✅ [DASHBOARD] Victims loaded:', victimsData);

      setStats(statsData);
      setVictims(victimsData.victims);
      setPagination(victimsData.pagination);
      setLastUpdate(new Date());

      if (victimsData.victims.length === 0) {
        console.warn('⚠️ [DASHBOARD] No victims data found in database');
      }
    } catch (error) {
      console.error('❌ [DASHBOARD] Error loading dashboard data:', error);
      console.error('❌ [DASHBOARD] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      const errorMessage = error.message.includes('Failed to fetch')
        ? 'Cannot connect to API. Check if the server is running and MONGODB_URI is configured in Vercel.'
        : error.message.includes('500')
        ? 'Server error. Check MongoDB connection and API logs in Vercel.'
        : `Error: ${error.message}`;

      setError(errorMessage);

      // Still show alert for backward compatibility
      alert(`Error loading data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
    setIsLoading(true);

    try {
      const victimsData = await fetchVictims(newPage, 20);
      setVictims(victimsData.victims);
      setPagination(victimsData.pagination);
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      // Fetch all victims for export
      const allVictimsData = await fetchVictims(1, 10000);
      const csvContent = exportToCSV(allVictimsData.victims);
      downloadCSV(csvContent, `victims-export-${Date.now()}.csv`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    }
  };

  // Clear database
  const handleClearDatabase = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL victim data.\n\nThis action cannot be undone.\n\nAre you sure you want to continue?'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'Final confirmation: Type the password again in the next prompt to confirm deletion.'
    );

    if (!doubleConfirm) return;

    const confirmPassword = window.prompt('Enter dashboard password to confirm:');

    if (confirmPassword !== 'admin2024') {
      alert('Invalid password. Database not cleared.');
      return;
    }

    try {
      await clearDatabase(confirmPassword);
      alert('✅ Database cleared successfully');
      loadDashboardData(); // Reload empty data
    } catch (error) {
      console.error('Error clearing database:', error);
      alert('Error clearing database');
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (isAuthenticated && autoRefresh) {
      const interval = setInterval(() => {
        loadDashboardData();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, autoRefresh, currentPage]);

  // Render authentication screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-apex-dark flex items-center justify-center p-4">
        <div className="apex-card max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-apex-red mb-2">Dashboard Access</h1>
            <p className="text-gray-400">Enter password to view analytics</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="apex-input"
                placeholder="Enter dashboard password"
                autoFocus
              />
              {authError && <p className="mt-2 text-sm text-red-500">{authError}</p>}
            </div>

            <button type="submit" className="apex-button w-full">
              Access Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-apex-green transition-colors"
            >
              ← Back to simulation
            </button>
          </div>

          <div className="mt-6 text-xs text-center text-gray-600">
            <p>🎓 Educational Project - Ciberseguridad del Bienestar</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !stats) {
    return (
      <div className="min-h-screen bg-apex-dark flex items-center justify-center p-4">
        <div className="apex-card max-w-2xl w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-apex-red mb-4">Dashboard Error</h2>
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-left whitespace-pre-wrap">{error}</p>
            </div>

            <div className="text-left text-gray-300 space-y-2 mb-6 text-sm">
              <p className="font-bold text-apex-gold">Common Issues:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>MongoDB connection string not set in Vercel environment variables</li>
                <li>MongoDB database is empty (no captured data yet)</li>
                <li>API endpoints not deployed or responding</li>
                <li>Network connectivity issues</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setError(null);
                  loadDashboardData();
                }}
                className="apex-button"
              >
                🔄 Retry
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-apex-darker border-2 border-apex-gold/30 rounded-lg hover:border-apex-gold transition-colors"
              >
                ← Back to Simulation
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-600">
              <p>Check browser console (F12) for detailed error logs</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render loading state
  if (!stats) {
    return (
      <div className="min-h-screen bg-apex-dark flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-apex-red mb-4"></div>
          <p className="text-xl text-apex-green">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-apex-dark via-gray-900 to-black p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="container mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-apex-red">Phishing</span>{' '}
              <span className="text-white">Analytics</span>
            </h1>
            <p className="text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                autoRefresh
                  ? 'bg-apex-green/20 border-apex-green text-apex-green'
                  : 'bg-gray-800 border-gray-600 text-gray-400'
              }`}
            >
              {autoRefresh ? '✓ Auto-refresh' : 'Auto-refresh off'}
            </button>
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="px-4 py-2 bg-apex-darker border-2 border-apex-red/30 rounded-lg hover:border-apex-red transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
            <button
              onClick={handleClearDatabase}
              className="px-4 py-2 bg-red-900/30 border-2 border-red-600 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
            >
              🗑️ Clear DB
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-apex-darker border-2 border-apex-gold/30 rounded-lg hover:border-apex-gold transition-colors"
            >
              ← Back to Simulation
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Victims"
            value={stats.totalVictims}
            icon="👥"
            color="text-apex-red"
          />
          <StatsCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon="🎯"
            color="text-apex-gold"
          />
          <StatsCard
            title="Avg Time (sec)"
            value={stats.averageTime}
            icon="⏱️"
            color="text-apex-green"
          />
          <StatsCard
            title="Unique Locations"
            value={stats.uniqueLocations}
            icon="🌍"
            color="text-purple-400"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="VPN Users"
            value={stats.vpnUsers}
            icon="🔐"
            color="text-yellow-500"
          />
          <StatsCard
            title="Mobile Devices"
            value={stats.deviceBreakdown.mobile}
            icon="📱"
            color="text-blue-400"
          />
          <StatsCard
            title="Desktop Devices"
            value={stats.deviceBreakdown.desktop}
            icon="💻"
            color="text-cyan-400"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimelineChart data={stats.hourlyData} />
          <DeviceChart data={stats.deviceBreakdown} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LocationChart data={stats.topCountries} title="Top Countries" />
          <LocationChart data={stats.topCities} title="Top Cities" />
        </div>

        {/* Victims Table */}
        <VictimTable
          victims={victims}
          pagination={pagination}
          onPageChange={handlePageChange}
          onExport={handleExport}
        />

        {/* Footer */}
        <div className="text-center py-8 text-gray-600 text-sm">
          <p>⚠️ Educational Cybersecurity Project</p>
          <p className="mt-2">
            This dashboard displays data collected from a phishing awareness simulation.
          </p>
          <p className="mt-1">All data is used for educational purposes only.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
