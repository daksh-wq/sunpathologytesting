import { Routes, Route, NavLink } from 'react-router-dom'
import { CallProvider } from './context/CallContext'
import CallInterface from './components/CallInterface'
import Dashboard from './components/Dashboard'
import ChatInterface from './components/ChatInterface'

// SVG Icons
const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const LabIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6v2H9z" />
    <path d="M10 5v4l-4 8h12l-4-8V5" />
    <path d="M6 17h12" />
  </svg>
)

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
)

function App() {
  return (
    <CallProvider>
      {/* Top header — visible on desktop only */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <LabIcon />
          </div>
          <span>Sun Pathology Lab</span>
        </div>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PhoneIcon />
            <span>Call</span>
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ChartIcon />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ChatIcon />
            <span>LLM Chat</span>
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<CallInterface />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatInterface />} />
        </Routes>
      </main>

      {/* Bottom navigation — visible on mobile only */}
      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <PhoneIcon />
          <span>Call</span>
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <ChartIcon />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <ChatIcon />
          <span>Chat</span>
        </NavLink>
      </nav>
    </CallProvider>
  )
}

export default App
