import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastCount = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000, action }) => {
    const id = `toast-${Date.now()}-${++toastCount}`;
    const newToast = { id, type, title, message, duration, action, createdAt: Date.now() };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', title: options.title || 'Success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', title: options.title || 'Error', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', title: options.title || 'Notice', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', title: options.title || 'Warning', message, ...options }),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '420px',
        width: 'calc(100% - 3rem)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());

  const config = {
    success: {
      icon: CheckCircle2,
      accentColor: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      titleColor: '#6ee7b7',
      progressBg: '#10b981',
    },
    error: {
      icon: AlertCircle,
      accentColor: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      titleColor: '#fca5a5',
      progressBg: '#ef4444',
    },
    warning: {
      icon: AlertTriangle,
      accentColor: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.35)',
      titleColor: '#fcd34d',
      progressBg: '#f59e0b',
    },
    info: {
      icon: Info,
      accentColor: '#6366f1',
      bgGlow: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.35)',
      titleColor: '#a5b4fc',
      progressBg: '#6366f1',
    },
  }[toast.type] || config.info;

  const Icon = config.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        pointerEvents: 'auto',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${config.border}`,
        borderLeft: `4px solid ${config.accentColor}`,
        borderRadius: '12px',
        boxShadow: `0 12px 30px rgba(0, 0, 0, 0.45), 0 0 20px ${config.bgGlow}`,
        padding: '1rem 1.15rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        animation: 'nexoraToastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
        <div
          style={{
            color: config.accentColor,
            flexShrink: 0,
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} />
        </div>

        <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
          {toast.title && (
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 650,
                color: config.titleColor,
                marginBottom: '0.2rem',
                letterSpacing: '-0.01em',
              }}
            >
              {toast.title}
            </div>
          )}
          <div
            style={{
              fontSize: '0.85rem',
              color: '#e2e8f0',
              lineHeight: 1.45,
              wordBreak: 'break-word',
            }}
          >
            {toast.message}
          </div>

          {toast.action && (
            <div style={{ marginTop: '0.65rem' }}>
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick();
                  onRemove();
                }}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: `1px solid ${config.accentColor}`,
                  background: config.bgGlow,
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            flexShrink: 0,
            transition: 'color 0.15s ease',
          }}
          title="Dismiss notification"
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
        >
          <X size={16} />
        </button>
      </div>

      {toast.duration > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: config.progressBg,
              animation: `nexoraToastProgress ${toast.duration}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
}

