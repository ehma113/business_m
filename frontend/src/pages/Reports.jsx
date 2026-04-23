import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { useToast } from '../components/Toast';

function Reports() {
  const [topCustomers, setTopCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const response = await apiClient.get('/reports/');
      setTopCustomers(response.data.top_customers);
      setTopProducts(response.data.top_products);
    } catch {
      toast.show('Failed to load reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  const ReportTable = ({ title, icon, data, columns }) => (
    <div style={{
      background: '#fff', borderRadius: '12px',
      padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        fontSize: '18px', fontWeight: 600, marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <i className={`fas ${icon}`} style={{ color: '#4361ee' }}></i> {title}
      </h3>
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
          <i className={`fas ${icon}`} style={{ fontSize: '36px', display: 'block', marginBottom: '10px', opacity: 0.5 }}></i>
          <p>No data available</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c} style={{
                  background: '#f8f9fa', padding: '12px', textAlign: 'left',
                  fontWeight: 600, fontSize: '13px', borderBottom: '1px solid #eee'
                }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontSize: '14px' }}>{row.name}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{row.count}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>${parseFloat(row.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px'
      }}>
        <ReportTable
          title="Top Customers"
          icon="fa-crown"
          data={topCustomers}
          columns={['Customer', 'Orders', 'Revenue']}
        />
        <ReportTable
          title="Top Products"
          icon="fa-box"
          data={topProducts}
          columns={['Product', 'Units Sold', 'Revenue']}
        />
      </div>
    </div>
  );
}

export default Reports;