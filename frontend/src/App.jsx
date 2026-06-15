import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Compass, UserCheck, Shield, Sparkles, LogOut, LogIn, ChevronDown } from 'lucide-react';

// Pages
import Directory from './pages/Directory.jsx';
import CreatorProfile from './pages/CreatorProfile.jsx';
import CreatorDashboard from './pages/CreatorDashboard.jsx';
import SubscriberDashboard from './pages/SubscriberDashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

function AppContent({ auth, setAuth }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(null);
    navigate('/');
  };

  return (
    <div>
      {/* Sleek Glassmorphic Navbar */}
      <header className="glass-panel" style={{ 
        margin: '16px', 
        padding: '16px 32px', 
        borderRadius: 'var(--radius-xl)', 
        position: 'sticky', 
        top: '16px', 
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid hsl(var(--border-glass))'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px hsl(var(--primary-glow))'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontWeight: '800', fontSize: '20px', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, hsl(var(--text-secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HORIZON
          </span>
        </Link>

        {/* Action Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-secondary))' }} className="nav-link">
            <Compass size={16} /> Explore Creators
          </Link>

          {auth ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {auth.isCreator ? (
                <Link to="/creator-dashboard" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <Shield size={14} /> Creator Hub
                </Link>
              ) : (
                <Link to="/subscriber-dashboard" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <UserCheck size={14} /> My Subscriptions
                </Link>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid hsl(var(--border-glass))', paddingLeft: '16px' }}>
                <span style={{ fontSize: '14px', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>
                  {auth.username}
                </span>
                <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)' }} title="Sign Out">
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <LogIn size={14} /> Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Main Pages */}
      <main style={{ minHeight: 'calc(100vh - 140px)' }}>
        <Routes>
          <Route path="/" element={<Directory />} />
          <Route path="/creator/:id" element={<CreatorProfile auth={auth} />} />
          <Route path="/creator-dashboard" element={<CreatorDashboard auth={auth} />} />
          <Route path="/subscriber-dashboard" element={<SubscriberDashboard auth={auth} />} />
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="/register" element={<Register setAuth={setAuth} />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid hsl(var(--border-glass))', padding: '32px 16px', marginTop: '80px', textAlign: 'center', fontSize: '13px', color: 'hsl(var(--text-muted))' }}>
        <div>© 2026 Horizon UGC Inc. All rights reserved. Built with glassmorphic React design.</div>
      </footer>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setAuth(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <AppContent auth={auth} setAuth={setAuth} />
    </Router>
  );
}
