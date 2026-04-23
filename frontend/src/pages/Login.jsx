import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

// Extracted repeated input style
const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box'
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      // ✅ CLEANED: No more try/catch wrapper needed
      toast.show('Login successful! Welcome back.');
    } catch (err) {
      const errorData = err.response?.data;
      let message = 'Something went wrong. Please try again.';
      
      if (errorData) {
        if (errorData.error) {
          message = errorData.error;
        } else if (errorData.email) {
          message = errorData.email[0];
        } else if (errorData.password) {
          message = errorData.password[0];
        } else if (errorData.non_field_errors) {
          message = errorData.non_field_errors[0];
        } else {
          message = Object.values(errorData).flat().join('. ');
        }
      }
      
      // ✅ CLEANED: No more try/catch wrapper needed
      toast.show(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)',
          color: '#fff',
          padding: '30px 20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '28px', margin: '0 0 10px 0' }}>
            <i className="fas fa-briefcase"></i> Business Manager
          </h1>
          <p style={{ opacity: 0.9, fontSize: '14px', margin: 0 }}>Manage your business with ease</p>
        </div>

        <div style={{
          display: 'flex',
          background: '#f8f9fa'
        }}>
          <Link to="/login" style={{
            flex: 1,
            padding: '15px',
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 500,
            color: '#4361ee',
            background: '#fff',
            borderBottom: '2px solid #4361ee'
          }}>Login</Link>
          <Link to="/signup" style={{
            flex: 1,
            padding: '15px',
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 500,
            color: '#6c757d'
          }}>Sign Up</Link>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={inputStyle} // ✅ CLEANED: Used variable
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={inputStyle} // ✅ CLEANED: Used variable
            />
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <Link to="/forgot-password" style={{ color: '#4361ee', textDecoration: 'none', fontSize: '13px' }}>
                Forgot Password?
              </Link>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#6c757d' : '#4361ee',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <><span className="spinner"></span> Logging in...</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i> Login</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;