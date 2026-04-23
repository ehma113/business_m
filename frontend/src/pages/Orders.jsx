import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // ✅ ADDED: State to track which order we are about to delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [form, setForm] = useState({
    customer: '', product: '', amount: '', date: '',
    payment_status: 'unpaid', delivery_status: 'undelivered', 
    payment_due_date: '', 
    delivery_due_date: '', 
    notes: ''
  });
  
  const toast = useToast();

  const fetchData = () => {
    apiClient.get('/orders/').then(res => setOrders(res.data));
    apiClient.get('/customers/').then(res => setCustomers(res.data));
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({
      customer: '', product: '', amount: '', date: new Date().toISOString().split('T')[0],
      payment_status: 'unpaid', delivery_status: 'undelivered', 
      payment_due_date: '', delivery_due_date: '', notes: ''
    });
    setModalOpen(true);
  };

  const openEdit = (order) => {
    setEditing(order.id);
    setForm({
      customer: order.customer, product: order.product, amount: order.amount,
      date: order.date, payment_status: order.payment_status,
      delivery_status: order.delivery_status,
      payment_due_date: order.payment_due_date || '', 
      delivery_due_date: order.delivery_due_date || '', 
      notes: order.notes || ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.customer || !form.product || !form.amount || !form.date) {
      toast.show('Please fill in all required fields.', 'error');
      return;
    }
    try {
      if (editing) {
        await apiClient.put(`/orders/${editing}/`, form);
      } else {
        await apiClient.post('/orders/', form);
      }
      setModalOpen(false);
      fetchData();
      toast.show(editing ? 'Order updated successfully.' : 'Order added successfully.');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) toast.show(Object.values(errors).flat().join(' '), 'error');
      else toast.show('Failed to save order.', 'error');
    }
  };

  // ✅ CHANGED: This now just opens the custom modal, no more "localhost says"
  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  // ✅ ADDED: This actually deletes the order when they click "Yes"
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/orders/${deleteTarget}/`);
      fetchData();
      toast.show('Order deleted successfully.');
    } catch {
      toast.show('Failed to delete order.', 'error');
    } finally {
      setDeleteTarget(null); // Close the modal
    }
  };

  const statusBadge = (status) => {
    const colors = {
      paid: { bg: 'rgba(6,255,165,0.1)', color: '#06ffa5' },
      unpaid: { bg: 'rgba(255,190,11,0.1)', color: '#ffbe0b' },
      delivered: { bg: 'rgba(67,97,238,0.1)', color: '#4361ee' },
      undelivered: { bg: 'rgba(255,0,110,0.1)', color: '#ff006e' }
    };
    const c = colors[status] || colors.unpaid;
    return (
      <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, background: c.bg, color: c.color }}>{status}</span>
    );
  };

  const inputStyle = { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{margin:0, fontSize:'18px', fontWeight:600}}>All Orders</h3>
          <button onClick={openAdd} style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 500, cursor: 'pointer', background: '#4361ee', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-plus"></i> Add Order
          </button>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr>
                {['Order ID','Date','Customer','Product','Amount','Payment','Delivery','Actions'].map(h => (
                  <th key={h} style={{ background:'#f8f9fa', padding:'15px', textAlign:'left', fontWeight:600, fontSize:'14px', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={8} style={{textAlign:'center', padding:'40px', color:'#6c757d'}}><h3>No orders yet</h3><p>Create your first order</p></td></tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} style={{borderBottom:'1px solid #eee'}}>
                    <td style={{padding:'15px'}}>#{String(o.id).slice(-6)}</td>
                    <td style={{padding:'15px'}}>{o.date}</td>
                    <td style={{padding:'15px'}}>{o.customer_name || 'Unknown'}</td>
                    <td style={{padding:'15px'}}>{o.product}</td>
                    <td style={{padding:'15px'}}>${Number(o.amount).toFixed(2)}</td>
                    <td style={{padding:'15px'}}>{statusBadge(o.payment_status)}</td>
                    <td style={{padding:'15px'}}>{statusBadge(o.delivery_status)}</td>
                    <td style={{padding:'15px'}}>
                      <div style={{display:'flex', gap:'8px'}}>
                        <button onClick={() => openEdit(o)} title="Edit Order" style={{ padding:'6px 12px', border:'none', borderRadius:'6px', fontSize:'12px', cursor:'pointer', background:'#4361ee', color:'#fff' }}><i className="fas fa-edit"></i></button>
                        <button onClick={() => handleDelete(o.id)} title="Delete Order" style={{ padding:'6px 12px', border:'none', borderRadius:'6px', fontSize:'12px', cursor:'pointer', background:'#ff006e', color:'#fff' }}><i className="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      <Modal active={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Order' : 'Add New Order'} footer={
          <>
            <button onClick={() => setModalOpen(false)} style={{ padding:'12px 24px', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', background:'#6c757d', color:'#fff' }}>Cancel</button>
            <button onClick={handleSave} style={{ padding:'12px 24px', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', background:'#4361ee', color:'#fff' }}>{editing ? 'Update Order' : 'Save Order'}</button>
          </>
        }>
        {/* Form fields remain exactly the same, just truncated here for space */}
        <div style={{marginBottom:'20px'}}>
          <label style={{display:'block', marginBottom:'8px', fontWeight:500}}>Customer *</label>
          <select value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} style={inputStyle}>
            <option value="">Select a customer</option>
            {customers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={{display:'block', marginBottom:'8px', fontWeight:500}}>Product *</label>
          <input style={inputStyle} value={form.product} onChange={e => setForm({...form, product: e.target.value})} placeholder="Enter product name" />
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={{display:'block', marginBottom:'8px', fontWeight:500}}>Amount ($) *</label>
          <input type="number" step="0.01" min="0" style={inputStyle} value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0.00" />
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={{display:'block', marginBottom:'8px', fontWeight:500}}>Order Date *</label>
          <input type="date" style={inputStyle} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
        </div>
        <div style={{marginBottom:'20px', display:'flex', gap:'15px'}}>
          <div style={{flex:1}}>
            <label style={{display:'block', marginBottom:'8px', fontWeight:500}}>Payment Due By</label>
            <input type="date" style={inputStyle} value={form.payment_due_date} onChange={e => setForm({...form, payment_due_date: e.target.value})} />
          </div>
          <div style={{flex:1}}>
            <label style={{display:'block', marginBottom:'8px', fontWeight:500}}>Delivery Due By</label>
            <input type="date" style={inputStyle} value={form.delivery_due_date} onChange={e => setForm({...form, delivery_due_date: e.target.value})} />
          </div>
        </div>
        <div style={{marginBottom:'20px', display:'flex', gap:'15px'}}>
          <div style={{flex:1}}>
            <label style={{display:'block', marginBottom:'8px', fontWeight:500}}>Payment</label>
            <select value={form.payment_status} onChange={e => setForm({...form, payment_status: e.target.value})} style={inputStyle}>
              <option value="unpaid">Unpaid</option><option value="paid">Paid</option>
            </select>
          </div>
          <div style={{flex:1}}>
            <label style={{display:'block', marginBottom:'8px', fontWeight:500}}>Delivery</label>
            <select value={form.delivery_status} onChange={e => setForm({...form, delivery_status: e.target.value})} style={inputStyle}>
              <option value="undelivered">Undelivered</option><option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{display:'block', marginBottom:'8px', fontWeight:600}}>Notes</label>
          <textarea style={{...inputStyle, resize:'vertical'}} rows="3" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Add any order notes"></textarea>
        </div>
      </Modal>

      {/* ✅ ADDED: CUSTOM DELETE CONFIRMATION MODAL */}
      <Modal 
        active={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        title="Delete Order?"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} style={{ padding:'12px 24px', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', background:'#6c757d', color:'#fff' }}>Cancel</button>
            <button onClick={confirmDelete} style={{ padding:'12px 24px', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer', background:'#ff006e', color:'#fff' }}>Yes, Delete</button>
          </>
        }
      >
        <p style={{ margin: 0, color: '#6c757d', lineHeight: '1.5' }}>
          Are you sure you want to delete this order? This action cannot be undone and will remove it from your sales history.
        </p>
      </Modal>

    </div>
  );
}

export default Orders;