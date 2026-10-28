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

  // Spread operator updates form state cleanly
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
      // Spread operator merges response attributes into component state
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
    <div style={{ maxWidth: '440px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#fff',
            }}
          >
            <KeyRound size={22} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter your registered email and we'll send a password recovery link
          </p>
        </div>

        {state.error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{state.error}</span>
          </div>
        )}

        {state.sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--status-success)', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--status-success)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Reset Link Dispatched!
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              If an account exists for {state.email}, you will receive password reset instructions.
            </p>

            {state.previewToken && (
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                  DEV PREVIEW RESET LINK:
                </div>
                <Link
                  to={`/reset-password?token=${state.previewToken}`}
                  style={{ color: 'var(--primary)', fontSize: '0.85rem', wordBreak: 'break-all' }}
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
                color: 'var(--primary)',
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
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
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
                    color: 'var(--text-dim)',
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
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={state.loading}
              className="btn btn-primary"
              style={{ padding: '0.75rem', width: '100%', opacity: state.loading ? 0.7 : 1 }}
            >
              <span>{state.loading ? 'Sending Instructions...' : 'Send Recovery Link'}</span>
              <Send size={16} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
