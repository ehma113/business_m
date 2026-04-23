import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const thStyle = { background: '#f8f9fa', padding: '15px', textAlign: 'left', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #eee' };
const tdStyle = { padding: '15px', borderBottom: '1px solid #eee', fontSize: '14px' };
const emptyStyle = { textAlign: 'center', padding: '40px', color: '#6c757d' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 500 };
const inputStyle = { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' };
const btnPrimary = { padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 500, cursor: 'pointer', background: '#4361ee', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' };
const btnSecondary = { padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 500, cursor: 'pointer', background: '#6c757d', color: '#fff' };
const btnSmPrimary = { padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', background: '#4361ee', color: '#fff' };
const btnSmDanger = { padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', background: '#ff006e', color: '#fff' };
const btnDanger = { padding: '12px 24px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 500, cursor: 'pointer', background: '#ff006e', color: '#fff' }; // Added for modal delete button

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // ✅ NEW: Track what mode the modal is in ('add', 'edit', or 'delete')
  const [modalMode, setModalMode] = useState('add'); 
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // Stores {id, name} of customer to delete
  
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const toast = useToast();

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await apiClient.get('/customers/');
      setCustomers(response.data);
    } catch {
      toast.show('Failed to load customers.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const getErrorMessage = (err, fallback) => {
    const errors = err.response?.data;
    if (errors) return errors.detail || errors.error || Object.values(errors).flat().join(' ');
    return fallback;
  };

  const openAdd = () => {
    setModalMode('add');
    setEditing(null);
    setForm({ name: '', phone: '', email: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setModalMode('edit');
    setEditing(customer.id);
    setForm({ name: customer.name, phone: customer.phone, email: customer.email || '', notes: customer.notes || '' });
    setModalOpen(true);
  };

  // ✅ NEW: Opens the modal in delete mode instead of using window.confirm
  const openDelete = (customer) => {
    setModalMode('delete');
    setDeleteTarget({ id: customer.id, name: customer.name });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.phone) {
      toast.show('Please fill in all required fields.', 'error');
      return;
    }
    setModalOpen(false);
    const isEditing = !!editing;
    const request = isEditing ? apiClient.put(`/customers/${editing}/`, form) : apiClient.post('/customers/', form);

    request
      .then((res) => {
        if (isEditing) {
          setCustomers(prev => prev.map(c => c.id === editing ? { ...c, ...res.data } : c));
          toast.show('Customer updated successfully.');
        } else {
          setCustomers(prev => [res.data, ...prev]);
          toast.show('Customer added successfully.');
        }
      })
      .catch((err) => {
        toast.show(getErrorMessage(err, `Failed to ${isEditing ? 'update' : 'add'} customer.`), 'error');
        fetchCustomers();
      });
  };

  // ✅ NEW: The actual delete logic, triggered by the Modal button
  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    setModalOpen(false); // Close modal instantly
    setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id)); // Optimistic update

    apiClient.delete(`/customers/${deleteTarget.id}/`)
      .then(() => {
        toast.show('Customer deleted successfully.');
      })
      .catch((err) => {
        toast.show(getErrorMessage(err, 'Failed to delete customer. They might have existing orders.'), 'error');
        fetchCustomers(); // Revert on failure
      })
      .finally(() => {
        setDeleteTarget(null); // Clear target
      });
  };

  // ✅ NEW: Dynamically set Modal Title and Footer Buttons based on mode
  const getModalTitle = () => {
    if (modalMode === 'delete') return 'Delete Customer';
    if (modalMode === 'edit') return 'Edit Customer';
    return 'Add New Customer';
  };

  const getModalFooter = () => {
    if (modalMode === 'delete') {
      return (
        <>
          <button onClick={() => setModalOpen(false)} style={btnSecondary}>Cancel</button>
          <button onClick={confirmDelete} style={btnDanger}>
            <i className="fas fa-trash"></i> Yes, Delete
          </button>
        </>
      );
    }
    return (
      <>
        <button onClick={() => setModalOpen(false)} style={btnSecondary}>Cancel</button>
        <button onClick={handleSave} style={btnPrimary}>{editing ? 'Update Customer' : 'Save Customer'}</button>
      </>
    );
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Customers</h3>
          <button onClick={openAdd} style={btnPrimary}><i className="fas fa-plus"></i> Add Customer</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Phone', 'Email', 'Total Orders', 'Total Spent', 'Actions'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={emptyStyle}>
                    <i className="fas fa-users" style={{ fontSize: '48px', display: 'block', marginBottom: '15px', opacity: 0.5 }}></i>
                    <h3>No customers yet</h3>
                    <p>Add your first customer to get started</p>
                  </td>
                </tr>
              ) : (
                customers.map(c => {
                  const hasOrders = c.total_orders > 0;
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={tdStyle}>{c.name}</td>
                      <td style={tdStyle}>{c.phone}</td>
                      <td style={tdStyle}>{c.email || '-'}</td>
                      <td style={tdStyle}>{c.total_orders}</td>
                      <td style={tdStyle}>${parseFloat(c.total_spent).toFixed(2)}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => openEdit(c)} title="Edit Customer" style={btnSmPrimary}><i className="fas fa-edit"></i></button>
                          
                          {/* ✅ UPDATED: Calls openDelete instead of handleDelete */}
                          <button 
                            onClick={() => openDelete(c)} 
                            title={hasOrders ? "Cannot delete: Customer has existing orders" : "Delete Customer"} 
                            disabled={hasOrders}
                            style={{ ...btnSmDanger, opacity: hasOrders ? 0.4 : 1, cursor: hasOrders ? 'not-allowed' : 'pointer' }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        active={modalOpen}
        onClose={() => setModalOpen(false)}
        title={getModalTitle()}
        footer={getModalFooter()}
      >
        {/* ✅ NEW: Conditional rendering inside the modal body */}
        {modalMode === 'delete' ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ff006e', marginBottom: '15px' }}></i>
            <p style={{ fontSize: '16px', color: '#333' }}>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
            </p>
            <p style={{ fontSize: '14px', color: '#6c757d' }}>This action cannot be undone.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter customer name" />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Phone *</label>
              <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Enter phone number" />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Enter email address" />
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, resize: 'vertical' }} rows="3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Add any notes"></textarea>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Customers;