import React from 'react';

function StatCard({ title, value, change, changeType, icon, iconBg }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '25px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'default'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <span style={{
          fontSize: '14px',
          color: '#6c757d',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {title}
        </span>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          background: iconBg || 'rgba(67,97,238,0.1)',
          color: icon ? undefined : '#4361ee'
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#212529', marginBottom: '5px' }}>
        {value}
      </div>
      {change && (
        <div style={{
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          color: changeType === 'positive' ? '#06ffa5' : changeType === 'negative' ? '#ff006e' : '#6c757d'
        }}>
          <i className={`fas fa-arrow-${changeType === 'positive' ? 'up' : changeType === 'negative' ? 'down' : 'minus'}`}></i>
          {change}
        </div>
      )}
    </div>
  );
}

export default StatCard;