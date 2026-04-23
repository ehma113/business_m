import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import StatCard from '../components/StatCard';
import { useToast } from '../components/Toast';

const thStyle = { 
  background: '#f8f9fa', padding: '15px', textAlign: 'left',
  fontWeight: 600, fontSize: '14px', textTransform: 'uppercase',
  letterSpacing: '0.5px', borderBottom: '1px solid #eee' 
};
const tdStyle = { padding: '15px', borderBottom: '1px solid #eee', fontSize: '14px' };
const emptyStyle = { textAlign: 'center', padding: '40px', color: '#6c757d' };
const markPaidBtnStyle = { 
  padding: '6px 12px', border: 'none', borderRadius: '6px',
  fontSize: '12px', cursor: 'pointer', background: '#4361ee', color: '#fff' 
};

const formatCurrency = (value) => `$${(parseFloat(value) || 0).toFixed(2)}`;

function Payments() {
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [stats, setStats] = useState({ 
    total_owed: 0, 
    customers_with_dues: 0, 
    overdue_amount: 0 
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchPayments = useCallback(async () => {
    try {
      const response = await apiClient.get('/payments/stats/');
      const data = response.data;
      
      const rawStats = data?.stats || {};
      
      setStats({
        total_owed: rawStats.total_owed ?? 0,
        customers_with_dues: rawStats.customers_with_dues ?? 0,
        overdue_amount: rawStats.overdue_amount ?? 0,
      });
      
      setUnpaidOrders(Array.isArray(data?.unpaid_orders) ? data.unpaid_orders : []);
    } catch (err) {
      console.error("Payment Fetch Error:", err);
      toast.show('Failed to load payment data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { 
    fetchPayments(); 
  }, [fetchPayments]);

  const markPaid = (orderId) => {
    setUnpaidOrders(prev => prev.filter(o => o.id !== orderId));

    apiClient.patch(`/orders/${orderId}/`, { payment_status: 'paid' })
      .then(() => {
        fetchPayments(); 
        toast.show('Payment marked as paid!');
      })
      .catch(() => {
        toast.show('Failed to update payment status.', 'error');
        fetchPayments(); 
      });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatCard
          title="Total Owed"
          value={formatCurrency(stats.total_owed)}
          change="From unpaid orders"
          icon={<i className="fas fa-money-bill-wave" style={{ color: '#ff006e' }}></i>}
          iconBg="rgba(255,0,110,0.1)"
        />
        <StatCard
          title="Customers with Dues"
          value={stats.customers_with_dues}
          change="Need follow-up"
          icon={<i className="fas fa-user-clock" style={{ color: '#ffbe0b' }}></i>}
          iconBg="rgba(255,190,11,0.1)"
        />
        <StatCard
          title="Overdue Payments"
          value={formatCurrency(stats.overdue_amount)}
          change="Require immediate action"
          icon={<i className="fas fa-exclamation-triangle" style={{ color: '#ff006e' }}></i>}
          iconBg="rgba(255,0,110,0.1)"
        />
      </div>

      <div style={{
        background: '#fff', borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden'
      }}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Unpaid Orders</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Order ID', 'Customer', 'Product', 'Amount', 'Order Date', 'Due Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unpaidOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" style={emptyStyle}>
                    <i className="fas fa-credit-card" style={{ fontSize: '48px', display: 'block', marginBottom: '15px', opacity: 0.5 }}></i>
                    <h3>No unpaid orders</h3>
                    <p>All payments are up to date</p>
                  </td>
                </tr>
              ) : (
                unpaidOrders.map(o => (
                  <tr key={o.id || Math.random()} style={tdStyle}>
                    {/* ✅ FIX: Force ID to be a string before calling .slice() */}
                    <td style={tdStyle}>#{String(o.id || '').slice(-6)}</td>
                    <td style={tdStyle}>{o.customer_name || 'Unknown'}</td>
                    <td style={tdStyle}>{o.product || '-'}</td>
                    <td style={tdStyle}>{formatCurrency(o.amount)}</td>
                    <td style={tdStyle}>{o.date || '-'}</td>
                    <td style={tdStyle}>{o.due_date || '-'}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                        background: o.is_overdue ? 'rgba(255,190,11,0.2)' : 'rgba(255,190,11,0.1)',
                        color: o.is_overdue ? '#e6a800' : '#ffbe0b'
                      }}>
                        {o.is_overdue ? 'Overdue' : 'Pending'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => markPaid(o.id)} style={markPaidBtnStyle}>
                        <i className="fas fa-check"></i> Mark Paid
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payments;