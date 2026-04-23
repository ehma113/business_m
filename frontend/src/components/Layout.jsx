import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/orders': 'Orders',
  '/payments': 'Payments',
  '/reports': 'Reports',
  '/data': 'Data Management',
};

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main style={{
        marginLeft: '250px',
        minHeight: '100vh',
        background: '#f5f7fb',
      }}
        className="main-content"
      >
        <TopHeader
          title={title}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div style={{ padding: '30px' }}>
          <Outlet />
        </div>
      </main>
    </>
  );
}

export default Layout;