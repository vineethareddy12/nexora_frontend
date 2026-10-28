import React, { useState } from 'react';
import { Lock, Bell, Shield, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { authApi } from '../../auth/api/authApi';

export default function ApplicantSettingsPage() {
  const { user, accessToken } = useAuth();

  // Form state using spread operator
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Spread operator updates form fields immutably
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (formData.newPassword !== formData.confirmNewPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    if (formData.newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    try {
      setLoading(true);
      await authApi.changePassword(formData.currentPassword, formData.newPassword, accessToken);

      setStatusMessage({ type: 'success', text: 'Password has been updated successfully in PostgreSQL database!' });
      // Reset form using spread operator
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your credentials, security preferences, and authenticated session settings.
        </p>
      </div>

      {statusMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            borderRadius: 'var(--radius-md)',
            background: statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${statusMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: statusMessage.type === 'success' ? '#4ade80' : '#f87171',
            fontSize: '0.9rem',
          }}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Account Identity Summary */}
        <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Verified Account Identity</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Full Legal Name</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {user?.fullName || 'Candidate'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Account Login Email</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {user?.email || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Lock size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Change Security Password</h3>
          </div>

          <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Current Password *
              </label>
              <input
                type="password"
                name="currentPassword"
                required
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                New Password (Minimum 8 characters) *
              </label>
              <input
                type="password"
                name="newPassword"
                required
                placeholder="Minimum 8 characters"
                value={formData.newPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmNewPassword"
                required
                placeholder="Repeat new password"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: loading ? 0.7 : 1 }}
            >
              <Save size={16} />
              <span>{loading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
