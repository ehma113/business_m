import React, { useState, useCallback, createContext, useContext, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const domFallback = useRef(false);

  const show = useCallback((message, type = 'success') => {
    try {
      if (!message) return;
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message: String(message), type }]);
    } catch (e) {
      // If React state fails, show directly in DOM
      fallbackToast(message, type);
    }
  }, []);

  const removeToast = useCallback((id) => {
    try {
      setToasts(prev => prev.filter(t => t.id !== id));
    } catch (e) {}
  }, []);

  return (
    // NEW:
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: '999999',
        display: 'flex', flexDirection: 'column', gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: { bg: '#06ffa5', fg: '#212529', icon: 'fa-check-circle' },
    error: { bg: '#ff006e', fg: '#ffffff', icon: 'fa-exclamation-circle' },
    warning: { bg: '#ffbe0b', fg: '#212529', icon: 'fa-exclamation-triangle' }
  };

  const s = styles[toast.type] || styles.success;

  return (
    <div style={{
      background: s.bg, color: s.fg, padding: '15px 20px', borderRadius: '10px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex',
      alignItems: 'flex-start', gap: '12px', minWidth: '300px', maxWidth: '450px',
      fontSize: '14px', fontWeight: '500', pointerEvents: 'auto',
      animation: 'slideIn 0.3s ease'
    }}>
      <i className={`fas ${s.icon}`} style={{ marginTop: '2px', flexShrink: 0 }}></i>
      <span style={{ flex: 1, lineHeight: '1.4' }}>{toast.message}</span>
    </div>
  );
}

// ULTIMATE FALLBACK - if React is completely broken
function fallbackToast(message, type) {
  try {
    const bg = { success: '#06ffa5', error: '#ff006e', warning: '#ffbe0b' }[type] || '#06ffa5';
    const fg = (type === 'success' || type === 'warning') ? '#212529' : '#fff';
    const div = document.createElement('div');
    div.style.cssText = `position:fixed;top:20px;right:20px;z-index:99999999;
      padding:15px 20px;border-radius:10px;background:${bg};color:${fg};
      font-size:14px;font-weight:500;box-shadow:0 10px 25px rgba(0,0,0,0.15);
      max-width:450px;animation:slideIn 0.3s ease;pointer-events:auto;`;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => {
      div.style.opacity = '0';
      div.style.transition = 'opacity 0.3s ease';
      setTimeout(() => div.remove(), 300);
    }, 4000);
  } catch (e) {
    // Absolute last resort - alert
    alert(message);
  }
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a fallback that works even without the provider
    return {
      show: (message, type) => fallbackToast(message, type)
    };
  }
  return context;
}