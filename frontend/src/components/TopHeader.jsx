import React from 'react';

function TopHeader({ title, onMenuToggle }) {
  return (
    <header style={{
      background: '#fff',
      padding: '15px 30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: '100'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={onMenuToggle}
          style={{
            display: window.innerWidth <= 768 ? 'block' : 'none',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: '#212529',
            cursor: 'pointer'
          }}
          className="mobile-menu-toggle"
        >
          <i className="fas fa-bars"></i>
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#212529', margin: 0 }}>
          {title}
        </h1>
      </div>
    </header>
  );
}

export default TopHeader;