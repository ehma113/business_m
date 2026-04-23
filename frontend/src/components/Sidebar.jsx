import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { path: '/dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { path: '/customers', icon: 'fa-users', label: 'Customers' },
  { path: '/orders', icon: 'fa-shopping-cart', label: 'Orders' },
  { path: '/payments', icon: 'fa-credit-card', label: 'Payments' },
  { path: '/reports', icon: 'fa-chart-bar', label: 'Reports' },
  { path: '/data', icon: 'fa-database', label: 'Data Management' },
];

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* ✅ FIX: Replaced window.innerWidth with standard CSS media queries */}
      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 250px;
          background: #212529;
          color: #fff;
          z-index: 1000;
          transition: transform 0.3s ease;
          transform: translateX(0);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        
        /* Hide sidebar off-screen by default on mobile */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          /* Slide in when class is applied */
          .sidebar.is-open {
            transform: translateX(0);
          }
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 999;
        }

        .sidebar-nav {
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          color: rgba(255,255,255,0.7);
          background: none;
          border: none;
          border-top: 1px solid rgba(255,255,255,0.1);
          width: 100%;
          cursor: pointer;
          font-size: 16px;
          margin-top: auto;
          transition: all 0.2s ease;
        }

        /* ✅ FIX: Replaced inline JS hover effects with clean CSS */
        .logout-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
      `}</style>

      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        {/* Header */}
        <div style={{
          padding: '20px',
          background: 'rgba(0,0,0,0.2)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0
        }}>
          <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <i className="fas fa-briefcase"></i> Business Manager
          </h2>
          
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '15px',
              paddingTop: '15px',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#4361ee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {/* ✅ FIX: Added fallback to prevent crash if user data is temporarily undefined */}
                {(user.business_name || user.email || 'B').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '16px', margin: '0 0 3px 0', 
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' 
                }}>
                  {user.business_name || 'Business'}
                </h3>
                <p style={{ 
                  fontSize: '12px', opacity: 0.7, margin: 0, 
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' 
                }}>
                  {user.email || ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px 20px',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                background: isActive ? '#4361ee' : 'transparent',
                transition: 'all 0.3s ease'
              })}
            >
              <i className={`fas ${item.icon}`} style={{ width: '20px', textAlign: 'center' }}></i>
              {item.label}
            </NavLink>
          ))}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            <i className="fas fa-sign-out-alt" style={{ width: '20px', textAlign: 'center' }}></i>
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;