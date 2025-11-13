import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PhishingPageNew from './pages/PhishingPageNew'
import Dashboard from './pages/Dashboard'

/**
 * Main Application Component
 *
 * EDUCATIONAL PROJECT WARNING:
 * This is an academic cybersecurity awareness project.
 * Purpose: Demonstrate phishing techniques for educational purposes only.
 *
 * Routes:
 * - / : Phishing simulation page (main demonstration)
 * - /dashboard : Analytics dashboard for collected data
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PhishingPageNew />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
