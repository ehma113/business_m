import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast'; // ✅ ADDED: Missing Import
import apiClient from '../api';

// Extracted styles outside component for performance
const inputStyle = {
  width: '100%', padding: '12px 15px', border: '1px solid #ddd',
  borderRadius: '8px', fontSize: '16px', outline: 'none', boxSizing: 'border-box'
};

const strengthColors = ['', '#ff006e', '#ffbe0b', '#06ffa5'];
const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

function Signup() {
  const [form, setForm] = useState({
    business_name: '',
    email: '',
    password: '',
    password2: '',
    business_start_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState({ score: 0, errors: [], strength: 0 });
  const { signup } = useAuth();
  const toast = useToast(); // ✅ ADDED: Initialize toast
  const navigate = useNavigate();

  const checkStrength = async (password) => {
    if (!password) {
      setStrength({ score: 0, errors: [], strength: 0 });
      return;
    }
    try {
      const response = await apiClient.post('/check-password-strength/', { password });
      setStrength(response.data);
    } catch(e) {
      // Silently fail on strength check so user can still type
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'password') checkStrength(value);
  };

  const looksLikeEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getErrorMessage = (err, fallback) => {
    const errors = err.response?.data;
    if (!errors) return fallback;
    if (errors.error) return errors.error;
    
    const parts = [];
    for (const key in errors) {
      const val = errors[key];
      if (Array.isArray(val)) {
        val.forEach(v => parts.push(v));
      } else {
        parts.push(String(val));
      }
    }
    return parts.join(' ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      toast.show('Please enter your email address.', 'error'); // ✅ CLEANED
      return;
    }

    if (form.password !== form.password2) {
      toast.show('Passwords do not match!', 'error'); // ✅ CLEANED
      return;
    }
    
    if (strength.strength < 3) {
      toast.show('Password is not strong enough.', 'error'); // ✅ CLEANED
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      setForm({ business_name: '', email: '', password: '', password2: '', business_start_date: '' });
      setStrength({ score: 0, errors: [], strength: 0 });
      toast.show('Account created! Pending activation.', 'warning'); // ✅ CLEANED
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      // ✅ FIXED: Removed the native alert() that caused "localhost says"
      const errorMsg = getErrorMessage(err, 'Something went wrong during signup.');
      toast.show(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px', overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
          color: '#fff', padding: '30px 20px', textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '28px', margin: '0 0 10px 0' }}>
            <i className="fas fa-briefcase"></i> Business Manager
          </h1>
          <p style={{ opacity: 0.9, fontSize: '14px', margin: 0 }}>Manage your business with ease</p>
        </div>

        <div style={{ display: 'flex', background: '#f8f9fa' }}>
          <Link to="/login" style={{
            flex: 1, padding: '15px', textAlign: 'center', textDecoration: 'none',
            fontSize: '16px', fontWeight: 500, color: '#6c757d'
          }}>Login</Link>
          <Link to="/signup" style={{
            flex: 1, padding: '15px', textAlign: 'center', textDecoration: 'none',
            fontSize: '16px', fontWeight: 500, color: '#4361ee',
            background: '#fff', borderBottom: '2px solid #4361ee'
          }}>Sign Up</Link>
        </div>

        <div style={{
          background: 'rgba(255, 190, 11, 0.1)',
          border: '1px solid rgba(255, 190, 11, 0.3)',
          padding: '12px 20px', margin: '20px 30px 0',
          borderRadius: '8px', fontSize: '13px', color: '#c49000',
          display: 'flex', alignItems: 'center', gap: '10px', lineHeight: '1.4'
        }}>
          <i className="fas fa-info-circle" style={{ flexShrink: 0, marginTop: '2px' }}></i>
          <span>After registration, your account must be approved by an admin before you can log in.</span>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Business Name</label>
            <input type="text" name="business_name" value={form.business_name} onChange={handleChange} placeholder="Enter your business name" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={inputStyle}
            />
            {form.email && !looksLikeEmail(form.email) && (
              <span style={{ fontSize: '12px', color: '#c49000', marginTop: '5px', display: 'block' }}>
                <i className="fas fa-exclamation-triangle"></i> This doesn't look like a valid email address
              </span>
            )}
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Create a strong password" required style={inputStyle} />
          </div>

          {form.password && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{
                    flex: 1, height: '4px', borderRadius: '2px',
                    background: i <= strength.score ? strengthColors[strength.strength] : '#e0e0e0',
                    transition: 'background 0.3s ease'
                  }}></div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: strengthColors[strength.strength] }}>
                  {strengthLabels[strength.strength] || ''}
                </span>
              </div>
              {strength.errors.length > 0 && strength.strength < 3 && (
                <div style={{ marginTop: '8px' }}>
                  {strength.errors.map((err, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#ff006e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fas fa-times-circle"></i> {err}
                    </div>
                  ))}
                </div>
              )}
              {strength.errors.length === 0 && strength.strength === 3 && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#06ffa5', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <i className="fas fa-check-circle"></i> All requirements met
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Confirm Password</label>
            <input type="password" name="password2" value={form.password2} onChange={handleChange} placeholder="Confirm your password" required style={{
              ...inputStyle,
              borderColor: form.password2 && form.password !== form.password2 ? '#ff006e' : '#ddd'
            }} />
            {form.password2 && form.password !== form.password2 && (
              <span style={{ fontSize: '12px', color: '#ff006e', marginTop: '5px', display: 'block' }}>
                <i className="fas fa-times-circle"></i> Passwords do not match
              </span>
            )}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Business Start Date</label>
            <input type="date" name="business_start_date" value={form.business_start_date} onChange={handleChange} required style={inputStyle} />
          </div>
          
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px 24px', border: 'none', borderRadius: '8px',
            fontSize: '16px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#6c757d' : '#4361ee', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            {loading ? <span className="spinner"></span> : <i className="fas fa-user-plus"></i>}
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;