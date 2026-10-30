import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from './api/authApi';

export default function ForgotPasswordPage() {
  const [state, setState] = useState({
    email: '',
    loading: false,
    sent: false,
    previewToken: null,
    error: null,
  });

  const handleChange = (e) => {
    const { value } = e.target;
    setState((prev) => ({
      ...prev,
      email: value,
      error: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authApi.forgotPassword(state.email.trim().toLowerCase());
      setState((prev) => ({
        ...prev,
        ...response.data,
        sent: true,
        loading: false,
        previewToken: response.data?.devPreviewToken || null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Unable to request password reset. Please try again.',
      }));
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: 'clamp(2rem, 5vw, 4rem) auto', padding: '0 clamp(1rem, 3vw, 1.5rem)', background: '#FFFFFF' }}>
      <div
        className="card"
        style={{
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            <KeyRound size={22} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem', color: '#0F172A', fontWeight: 700 }}>
            Reset Password
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Enter your registered email and we'll send a password recovery link
          </p>
        </div>

        {state.error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              borderRadius: '10px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '0.875rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, color: '#DC2626' }} />
            <span>{state.error}</span>
          </div>
        )}

        {state.sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={44} style={{ color: '#059669', margin: '0 auto 1rem' }} />
            <p style={{ color: '#059669', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Reset Link Dispatched!
            </p>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              If an account exists for {state.email}, you will receive password reset instructions.
            </p>

            {state.previewToken && (
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '1rem',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 600 }}>
                  DEV PREVIEW RESET LINK:
                </div>
                <Link
                  to={`/reset-password?token=${state.previewToken}`}
                  style={{ color: '#2563EB', fontSize: '0.85rem', wordBreak: 'break-all', fontWeight: 500 }}
                >
                  Click here to complete password reset &rarr;
                </Link>
              </div>
            )}

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#2563EB',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.45rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={state.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={state.loading}
              className="btn btn-primary"
              style={{ padding: '0.85rem', width: '100%', marginTop: '0.5rem', opacity: state.loading ? 0.7 : 1 }}
            >
              <span>{state.loading ? 'Dispatching Link...' : 'Send Reset Link'}</span>
              <Send size={16} />
            </button>
          </form>
        )}

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.75rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #E2E8F0',
            fontSize: '0.875rem',
            color: '#64748B',
          }}
        >
          Remembered your password?{' '}
          <Link to="/login" style={{ color: '#2563EB', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
