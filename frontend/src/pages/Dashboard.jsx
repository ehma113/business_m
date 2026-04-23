import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import apiClient from '../api';
import StatCard from '../components/StatCard';
import { useToast } from '../components/Toast';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

function Dashboard() {
  const [stats, setStats] = useState({
    total_revenue: 0,
    pending_orders: 0,
    unpaid_orders: 0,
    total_customers: 0
  });
  const [actionOrders, setActionOrders] = useState([]);
  const [salesData, setSalesData] = useState(null);
  const [chartView, setChartView] = useState('monthly');
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [compareMode, setCompareMode] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
    fetchSalesData();
  }, [chartYear]);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/dashboard/stats/');
      setStats(response.data.stats);
      setActionOrders(response.data.action_orders);
    } catch {
      toast.show('Failed to load dashboard data.', 'error');
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await apiClient.get('/sales/');
      setAvailableYears(response.data.map(s => s.year));
      const selected = response.data.find(s => s.year === chartYear);
      if (selected) {
        setSalesData(selected);
      }
    } catch {
      toast.show('Failed to load sales data.', 'error');
    }
  };

  const markPaid = (orderId) => {
    apiClient.patch(`/orders/${orderId}/`, { payment_status: 'paid' })
      .then(() => {
        setActionOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, payment_status: 'paid' } : o
        ).filter(o => !(o.payment_status === 'paid' && o.delivery_status === 'delivered')));
        setStats(prev => ({ ...prev, unpaid_orders: Math.max(0, prev.unpaid_orders - 1) }));
        try { toast.show('Payment marked as paid!'); } catch(e) {}
      })
      .catch(() => {
        try { toast.show('Failed to update.', 'error'); } catch(e) {}
      });
  };

  const markDelivered = (orderId) => {
    apiClient.patch(`/orders/${orderId}/`, { delivery_status: 'delivered' })
      .then(() => {
        setActionOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, delivery_status: 'delivered' } : o
        ).filter(o => !(o.payment_status === 'paid' && o.delivery_status === 'delivered')));
        setStats(prev => ({ ...prev, pending_orders: Math.max(0, prev.pending_orders - 1) }));
        try { toast.show('Order marked as delivered!'); } catch(e) {}
      })
      .catch(() => {
        try { toast.show('Failed to update.', 'error'); } catch(e) {}
      });
  };
  const toggleCompare = () => {
    if (!compareMode) {
      setCompareMode(true);
      toast.show('Showing year-over-year comparison.');
    } else {
      setCompareMode(false);
    }
  };

  const getChartConfig = () => {
    if (!salesData) return null;

    if (compareMode) {
      // Multi-year comparison
      const allSales = [];
      const colors = [
        { bg: 'rgba(67, 97, 238, 0.7)', border: 'rgba(67, 97, 238, 1)' },
        { bg: 'rgba(72, 149, 239, 0.7)', border: 'rgba(72, 149, 239, 1)' },
        { bg: 'rgba(6, 255, 165, 0.7)', border: 'rgba(6, 255, 165, 1)' },
        { bg: 'rgba(255, 190, 11, 0.7)', border: 'rgba(255, 190, 11, 1)' },
      ];

      // We need to refetch all years for comparison
      const buildDatasets = async () => {
        try {
          const response = await apiClient.get('/sales/');
          return response.data.map((sd, i) => ({
            label: String(sd.year),
            data: chartView === 'monthly' ? sd.monthly : sd.quarterly,
            borderColor: colors[i % colors.length].border,
            backgroundColor: colors[i % colors.length].bg,
            borderWidth: 2,
            tension: 0.4,
            fill: false
          }));
        } catch { return []; }
      };
      buildDatasets().then(datasets => {
        setCompareData({ labels: chartView === 'monthly'
          ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
          : ['Q1','Q2','Q3','Q4'],
          datasets
        });
      });
      return null;
    }

    const labels = chartView === 'monthly'
      ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      : ['Q1','Q2','Q3','Q4'];

    const values = chartView === 'monthly' ? salesData.monthly : salesData.quarterly;

    return {
      labels,
      datasets: [{
        label: 'Sales',
        data: values,
        backgroundColor: 'rgba(67, 97, 238, 0.2)',
        borderColor: 'rgba(67, 97, 238, 1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgba(67, 97, 238, 1)',
        pointBorderWidth: 2
      }]
    };
  };

  const [compareData, setCompareData] = useState(null);

  useEffect(() => {
    if (compareMode) {
      const colors = [
        { bg: 'rgba(67, 97, 238, 0.7)', border: 'rgba(67, 97, 238, 1)' },
        { bg: 'rgba(72, 149, 239, 0.7)', border: 'rgba(72, 149, 239, 1)' },
        { bg: 'rgba(6, 255, 165, 0.7)', border: 'rgba(6, 255, 165, 1)' },
        { bg: 'rgba(255, 190, 11, 0.7)', border: 'rgba(255, 190, 11, 1)' },
      ];
      apiClient.get('/sales/').then(response => {
        setCompareData({
          labels: chartView === 'monthly'
            ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            : ['Q1','Q2','Q3','Q4'],
          datasets: response.data.map((sd, i) => ({
            label: String(sd.year),
            data: chartView === 'monthly' ? sd.monthly : sd.quarterly,
            borderColor: colors[i % colors.length].border,
            backgroundColor: colors[i % colors.length].bg,
            borderWidth: 2,
            tension: 0.4,
            fill: false
          }))
        });
      });
    }
  }, [compareMode, chartView]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: compareMode },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        callbacks: {
          label: (ctx) => 'Sales: $' + ctx.parsed.y.toLocaleString()
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + (value / 1000) + 'k'
        }
      }
    }
  };

  const chartConfig = getChartConfig();
  const finalChartData = compareMode ? compareData : chartConfig;

  return (
    <div>
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatCard
          title="Total Revenue"
          value={`$${stats.total_revenue.toLocaleString()}`}
          icon={<i className="fas fa-dollar-sign" style={{color:'#4361ee'}}></i>}
          iconBg="rgba(67,97,238,0.1)"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pending_orders}
          icon={<i className="fas fa-clock" style={{color:'#ffbe0b'}}></i>}
          iconBg="rgba(255,190,11,0.1)"
        />
        <StatCard
          title="Unpaid Orders"
          value={stats.unpaid_orders}
          icon={<i className="fas fa-exclamation-triangle" style={{color:'#ff006e'}}></i>}
          iconBg="rgba(255,0,110,0.1)"
        />
        <StatCard
          title="Total Customers"
          value={stats.total_customers}
          icon={<i className="fas fa-users" style={{color:'#06ffa5'}}></i>}
          iconBg="rgba(6,255,165,0.1)"
        />
      </div>

      {/* Sales Chart */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h3 style={{margin:0, fontSize:'18px', fontWeight:600}}>Sales Overview</h3>
          <div style={{display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center'}}>
            <select
              value={chartYear}
              onChange={e => setChartYear(Number(e.target.value))}
              style={{
                padding:'8px 15px', border:'1px solid #ddd',
                borderRadius:'6px', fontSize:'14px', cursor:'pointer'
              }}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div style={{display:'flex'}}>
              <button
                onClick={() => setChartView('monthly')}
                style={{
                  padding:'8px 15px', border:'1px solid #ddd',
                  borderRadius: '6px 0 0 6px', cursor:'pointer',
                  fontSize:'14px',
                  background: chartView === 'monthly' ? '#4361ee' : '#fff',
                  color: chartView === 'monthly' ? '#fff' : '#333'
                }}
              >Monthly</button>
              <button
                onClick={() => setChartView('quarterly')}
                style={{
                  padding:'8px 15px', border:'1px solid #ddd',
                  borderRadius: '0 6px 6px 0', cursor:'pointer',
                  fontSize:'14px',
                  background: chartView === 'quarterly' ? '#4361ee' : '#fff',
                  color: chartView === 'quarterly' ? '#fff' : '#333'
                }}
              >Quarterly</button>
            </div>
            <button
              onClick={toggleCompare}
              style={{
                padding:'8px 15px', border:'none', borderRadius:'6px',
                cursor:'pointer', fontSize:'14px',
                background: compareMode ? '#06ffa5' : '#4361ee',
                color: compareMode ? '#212529' : '#fff',
                display:'flex', alignItems:'center', gap:'6px'
              }}
            >
              <i className="fas fa-chart-line"></i>
              {compareMode ? 'Single Year' : 'Compare Years'}
            </button>
          </div>
        </div>
        <div style={{height:'300px', position:'relative'}}>
          {finalChartData ? (
            <Line data={finalChartData} options={chartOptions} />
          ) : (
            <p style={{textAlign:'center', color:'#6c757d', paddingTop:'100px'}}>
              No sales data available for this period
            </p>
          )}
        </div>
      </div>

      {/* Action Required Orders Table */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 25px',
          borderBottom: '1px solid #eee'
        }}>
          <h3 style={{margin:0, fontSize:'18px', fontWeight:600}}>
            <i className="fas fa-tasks"></i> Action Required Orders
          </h3>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr>
                {['Order ID','Customer','Product','Amount','Payment','Delivery','Priority','Actions'].map(h => (
                  <th key={h} style={{
                    background:'#f8f9fa', padding:'15px', textAlign:'left',
                    fontWeight:600, fontSize:'14px', textTransform:'uppercase',
                    letterSpacing:'0.5px', borderBottom:'1px solid #eee'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {actionOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{textAlign:'center', padding:'40px', color:'#6c757d'}}>
                    <i className="fas fa-check-circle" style={{fontSize:'48px', display:'block', marginBottom:'15px', opacity:0.5}}></i>
                    <h3>All caught up!</h3>
                    <p>No orders require action</p>
                  </td>
                </tr>
              ) : (
                                actionOrders.map(order => (
                  <tr key={order.id} style={{borderBottom:'1px solid #eee'}}>
                    <td data-label="Order ID" style={{padding:'15px'}}>#{String(order.id).slice(-6)}</td>
                    <td data-label="Customer" style={{padding:'15px'}}>{order.customer_name}</td>
                    <td data-label="Product" style={{padding:'15px'}}>{order.product}</td>
                    <td data-label="Amount" style={{padding:'15px'}}>${Number(order.amount).toFixed(2)}</td>
                    <td data-label="Payment" style={{padding:'15px'}}>
                      <span style={{
                        padding:'5px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:500,
                        background: order.payment_status === 'paid' ? 'rgba(6,255,165,0.1)' : 'rgba(255,190,11,0.1)',
                        color: order.payment_status === 'paid' ? '#06ffa5' : '#ffbe0b'
                      }}>{order.payment_status}</span>
                    </td>
                    <td data-label="Delivery" style={{padding:'15px'}}>
                      <span style={{
                        padding:'5px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:500,
                        background: order.delivery_status === 'delivered' ? 'rgba(67,97,238,0.1)' : 'rgba(255,0,110,0.1)',
                        color: order.delivery_status === 'delivered' ? '#4361ee' : '#ff006e'
                      }}>{order.delivery_status}</span>
                    </td>
                    <td data-label="Priority" style={{padding:'15px'}}>
                      {order.is_high_priority ? (
                        <span style={{display:'inline-flex', alignItems:'center', gap:'5px'}}>
                          <span style={{width:'8px', height:'8px', borderRadius:'50%', background:'#ff006e', animation:'pulse 2s infinite'}}></span>
                          High
                        </span>
                      ) : (
                        order.payment_status === 'unpaid' ? 'Payment' : 'Delivery'
                      )}
                    </td>
                    <td data-label="Actions" style={{padding:'15px'}}>
                      <div style={{display:'flex', gap:'8px'}}>
                        {order.payment_status === 'unpaid' && (
                          <button onClick={() => markPaid(order.id)} title="Mark as Paid" style={{
                            padding:'6px 12px', border:'none', borderRadius:'6px',
                            fontSize:'12px', cursor:'pointer', background:'#06ffa5', color:'#212529'
                          }}><i className="fas fa-dollar-sign"></i></button>
                        )}
                        {order.delivery_status === 'undelivered' && (
                          <button onClick={() => markDelivered(order.id)} title="Mark as Delivered" style={{
                            padding:'6px 12px', border:'none', borderRadius:'6px',
                            fontSize:'12px', cursor:'pointer', background:'#4361ee', color:'#fff'
                          }}><i className="fas fa-truck"></i></button>
                        )}
                      </div>
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

export default Dashboard;