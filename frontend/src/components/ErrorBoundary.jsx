import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '400px', padding: '30px',
          textAlign: 'center'
        }}>
          <i className="fas fa-exclamation-triangle" style={{
            fontSize: '64px', color: '#ff006e', marginBottom: '20px'
          }}></i>
          <h2 style={{marginBottom: '10px'}}>Something went wrong</h2>
          <p style={{color:'#6c757d', marginBottom: '20px', maxWidth: '400px'}}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({hasError:false, error:null}); window.location.reload(); }}
            style={{
              padding: '12px 24px', border: 'none', borderRadius: '8px',
              fontSize: '16px', cursor: 'pointer', background: '#4361ee', color: '#fff'
            }}
          >
            <i className="fas fa-redo"></i> Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;