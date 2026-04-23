import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import { useToast } from '../components/Toast';

function ResetPassword() {
  const [form, setForm] = useState({ token: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [strength, setStrength] = useState({ score: 0, errors: [], strength: 0 });
  const toast = useToast();

  const checkStrength = async (password) => {
    if (!password) {
      setStrength({ score: 0, errors: [], strength: 0 });
      return;
    }
    try {
      const response = await apiClient.post('/check-password-strength/', { password });
      setStrength(response.data);
    } catch(e) {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'new_password') {
      checkStrength(value);
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate each field with specific messages
    if (!form.token) {
      try { toast.show('Please paste your reset token.', 'error'); } catch(e2) {}
      return;
    }
    if (!form.new_password) {
      try { toast.show('Please enter a new password.', 'error'); } catch(e2) {}
      return;
    }
    if (!form.confirm_password) {
      try { toast.show('Please confirm your new password.', 'error'); } catch(e2) {}
      return;
    }
    if (form.new_password !== form.confirm_password) {
      try { toast.show('Passwords do not match.', 'error'); } catch(e2) {}
      return;
    }
    if (strength.strength < 3) {
      try { toast.show('Password is not strong enough. Check the requirements below.', 'error'); } catch(e2) {}
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.post('/reset-password/', form);
      setSuccess(true);
      try { toast.show('Password reset successfully! You can now log in with your new password.'); } catch(e2) {}
    } catch (err) {
      const errors = err.response?.data;
      let message = 'Failed to reset password.';
      if (errors) {
        if (errors.error) message = errors.error;
        else if (errors.token) message = errors.token[0];
        else if (errors.new_password) message = errors.new_password[0];
        else if (errors.confirm_password) message = errors.confirm_password[0];
        else message = Object.values(errors).flat().join('. ');
      }
      try { toast.show(message, 'error'); } catch(e2) {}
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 15px', border: '1px solid #ddd',
    borderRadius: '8px', fontSize: '16px', outline: 'none', boxSizing: 'border-box'
  };

  const strengthColors = ['', '#ff006e', '#ffbe0b', '#06ffa5'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  if (success) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', padding: '20px'
      }}>
        <div style={{
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 10px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px',
          padding: '40px', textAlign: 'center'
        }}>
          <i className="fas fa-check-circle" style={{ fontSize: '64px', color: '#06ffa5', display: 'block', marginBottom: '20px' }}></i>
          <h2 style={{ marginBottom: '10px' }}>Password Reset!</h2>
          <p style={{ color: '#6c757d', marginBottom: '25px' }}>Your password has been changed successfully. You can now log in with your new password.</p>
          <Link to="/login" style={{
            display: 'inline-block', padding: '12px 24px', border: 'none',
            borderRadius: '8px', fontSize: '16px', fontWeight: 500,
            background: '#4361ee', color: '#fff', textDecoration: 'none'
          }}>
            <i className="fas fa-sign-in-alt"></i> Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)', padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px', overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
          color: '#fff', padding: '30px 20px', textAlign: 'center'
        }}>
          <i className="fas fa-key" style={{ fontSize: '48px', marginBottom: '15px', display: 'block' }}></i>
          <h1 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>Reset Password</h1>
          <p style={{ opacity: 0.9, fontSize: '14px', margin: 0 }}>Enter your token and choose a new password</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Reset Token *</label>
            <input name="token" value={form.token} onChange={handleChange} placeholder="Paste your reset token here" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>New Password *</label>
            <input type="password" name="new_password" value={form.new_password} onChange={handleChange} placeholder="Create a strong password" required style={inputStyle} />
          </div>

          {/* Password Strength Meter */}
          {form.new_password && (
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
                <span style={{
                  fontSize: '12px', fontWeight: 600,
                  color: strengthColors[strength.strength]
                }}>{strengthLabels[strength.strength] || ''}</span>
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Confirm Password *</label>
            <input type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} placeholder="Confirm your new password" required style={{
              ...inputStyle,
              borderColor: form.confirm_password && form.new_password !== form.confirm_password ? '#ff006e' : '#ddd'
            }} />
            {form.confirm_password && form.new_password !== form.confirm_password && (
              <span style={{ fontSize: '12px', color: '#ff006e', marginTop: '5px', display: 'block' }}>
                <i className="fas fa-times-circle"></i> Passwords do not match
              </span>
            )}
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px 24px', border: 'none', borderRadius: '8px',
            fontSize: '16px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#6c757d' : '#4361ee', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            {loading ? <span className="spinner"></span> : <i className="fas fa-save"></i>}
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ padding: '0 30px 30px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#4361ee', textDecoration: 'none', fontSize: '14px' }}>
            <i className="fas fa-arrow-left"></i> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;