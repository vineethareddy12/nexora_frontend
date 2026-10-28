import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { authApi } from './api/authApi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // If already authenticated, redirect immediately to relevant workspace
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Manage form state using an object
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Spread operator used to immutably update the specific field while keeping the rest
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      // Spread operator used to clone and map form data to backend payload
      const payload = {
        ...formData,
        fullName: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      // Call backend API
      const result = await authApi.register({
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
      });

      // Spread operator used to merge user and token states into auth session
      login({ ...result.user }, { ...result.tokens });

      // Navigate to candidate profile upon successful registration
      navigate('/app/profile');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '4rem auto', padding: '0 1.5rem' }}>
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
            <UserPlus size={22} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Applicant Registration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Create an account to apply for open roles and track your journey
          </p>
        </div>

        {error && (
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
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User
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
                type="text"
                name="name"
                required
                placeholder="e.g. Jane Doe"
                value={formData.name}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Email Address *
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
                name="email"
                required
                placeholder="jane@example.com"
                value={formData.email}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Mobile Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone
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
                type="tel"
                name="mobile"
                placeholder="+91 98765 43210"
                value={formData.mobile}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
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
                type="password"
                name="password"
                required
                placeholder="Minimum 8 characters (1 uppercase, 1 number, 1 symbol)"
                value={formData.password}
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
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.75rem', width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
          >
            <span>{loading ? 'Creating Account...' : 'Create Applicant Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.75rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
