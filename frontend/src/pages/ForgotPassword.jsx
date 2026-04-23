import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import { useToast } from '../components/Toast';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenSent, setTokenSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const toast = useToast();

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      try { toast.show('Please enter your email address.', 'error'); } catch(e2) {}
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post('/forgot-password/', { email });
      setResetToken(response.data.token);
      setTokenSent(true);
      try { toast.show('Reset token generated! Copy it and proceed to reset your password.'); } catch(e2) {}
    } catch (err) {
      const errors = err.response?.data;
      let message = 'Something went wrong. Please try again.';
      if (errors) {
        if (errors.email) message = errors.email[0];
        else if (errors.error) message = errors.error;
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

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px', overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
          color: '#fff', padding: '30px 20px', textAlign: 'center'
        }}>
          <i className="fas fa-lock" style={{ fontSize: '48px', marginBottom: '15px', display: 'block' }}></i>
          <h1 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>Forgot Password</h1>
          <p style={{ opacity: 0.9, fontSize: '14px', margin: 0 }}>
            Enter your email to receive a password reset token
          </p>
        </div>

        {!tokenSent ? (
          <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your registered email" required style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px 24px', border: 'none', borderRadius: '8px',
              fontSize: '16px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#6c757d' : '#4361ee', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {loading ? <span className="spinner"></span> : <i className="fas fa-paper-plane"></i>}
              {loading ? 'Sending...' : 'Send Reset Token'}
            </button>
          </form>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <i className="fas fa-check-circle" style={{ fontSize: '48px', color: '#06ffa5', display: 'block', marginBottom: '15px' }}></i>
            <h3 style={{ marginBottom: '10px' }}>Token Generated!</h3>
            <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '20px' }}>
              In production, this token would be sent to your email.<br/>
              For development, copy the token below:
            </p>
            <div style={{
              background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px',
              padding: '12px', fontFamily: 'monospace', fontSize: '13px',
              wordBreak: 'break-all', marginBottom: '20px', textAlign: 'left',
              display: 'flex', gap: '10px', alignItems: 'center'
            }}>
              <span style={{ flex: 1 }}>{resetToken}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(resetToken); try { toast.show('Token copied!'); } catch(e) {} }}
                style={{
                  padding: '6px 12px', border: 'none', borderRadius: '6px',
                  background: '#4361ee', color: '#fff', cursor: 'pointer', fontSize: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                <i className="fas fa-copy"></i> Copy
              </button>
            </div>
            <Link to="/reset-password" style={{
              display: 'block', width: '100%', padding: '12px 24px', border: 'none',
              borderRadius: '8px', fontSize: '16px', fontWeight: 500, cursor: 'pointer',
              background: '#4361ee', color: '#fff', textDecoration: 'none',
              textAlign: 'center'
            }}>
              <i className="fas fa-key"></i> Go to Reset Password
            </Link>
          </div>
        )}

        <div style={{ padding: '0 30px 30px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#4361ee', textDecoration: 'none', fontSize: '14px' }}>
            <i className="fas fa-arrow-left"></i> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;