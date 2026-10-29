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

      // Call backend API with phone/mobile included
      const result = await authApi.register({
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.mobile ? payload.mobile.trim() : undefined,
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
    <div style={{ maxWidth: '480px', margin: '4rem auto', padding: '0 1.5rem', background: '#FFFFFF' }}>
      <div
        className="card"
        style={{
          padding: '2.5rem',
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
            <UserPlus size={22} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.4rem', color: '#0F172A', fontWeight: 700 }}>
            Applicant Registration
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Create an account to apply for open roles and track your journey
          </p>
        </div>

        {error && (
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
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.45rem' }}>
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
                  color: '#94A3B8',
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
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#0F172A',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.45rem' }}>
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
                  color: '#94A3B8',
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
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#0F172A',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.45rem' }}>
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
                  color: '#94A3B8',
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
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  color: '#0F172A',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.45rem' }}>
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
                  color: '#94A3B8',
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
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '0.85rem', width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
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
            borderTop: '1px solid #E2E8F0',
            fontSize: '0.875rem',
            color: '#64748B',
          }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563EB', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
