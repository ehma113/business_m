import React from 'react';
import apiClient from '../api';
import { useToast } from '../components/Toast';

function DataManagement() {
  const toast = useToast();

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/data/export/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `business_data_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.show('Data exported successfully!');
    } catch {
      toast.show('Failed to export data.', 'error');
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to delete ALL business data? This cannot be undone!')) return;
    if (!window.confirm('FINAL WARNING: All customers, orders, and sales data will be permanently deleted. Continue?')) return;
    
    try {
      // ✅ UPDATED: Backend now requires this exact confirmation payload
      await apiClient.post('/data/clear/', { 
        confirm: "DELETE_ALL_DATA" 
      });
      
      toast.show('All data has been cleared.');
    } catch (err) {
      // ✅ UPDATED: Show the specific error message from the backend if it fails
      const errorMsg = err.response?.data?.error || 'Failed to clear data.';
      toast.show(errorMsg, 'error');
    }
  };

  return (
    <div>
      <div style={{
        background: '#fff', borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px', overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 25px', borderBottom: '1px solid #eee',
          background: '#f8f9fa'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Backup Your Data</h3>
        </div>
        <div style={{ padding: '25px' }}>
          <p style={{ marginBottom: '15px' }}>Export all your customers, orders, and sales data as a JSON file for backup or analysis.</p>
          <button onClick={handleExport} style={{
            padding: '12px 24px', border: 'none', borderRadius: '8px',
            fontSize: '16px', fontWeight: 500, cursor: 'pointer',
            background: '#4361ee', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <i className="fas fa-download"></i> Export Data
          </button>
        </div>
      </div>

      <div style={{
        background: '#fff', borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 25px', borderBottom: '1px solid #eee',
          background: 'rgba(255,0,110,0.1)'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#ff006e' }}>Clear All Data</h3>
        </div>
        <div style={{ padding: '25px' }}>
          <p style={{ marginBottom: '15px' }}><strong>Warning:</strong> This will permanently delete all your business data. This action cannot be undone.</p>
          <button onClick={handleClear} style={{
            padding: '12px 24px', border: 'none', borderRadius: '8px',
            fontSize: '16px', fontWeight: 500, cursor: 'pointer',
            background: '#ff006e', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <i className="fas fa-trash"></i> Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataManagement;