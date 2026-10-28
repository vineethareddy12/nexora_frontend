import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Briefcase, Mail, Info, LogIn, UserPlus, Phone, MapPin, User, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [company, setCompany] = React.useState(null);

  React.useEffect(() => {
    function fetchCompany() {
      import('../../features/public/company/companyApi.js').then(({ companyApi }) => {
        companyApi.getPublicProfile().then((data) => {
          if (data) setCompany(data);
        }).catch(() => {});
      });
    }

    fetchCompany();
    window.addEventListener('nexora:admin-authenticated', fetchCompany);
    return () => window.removeEventListener('nexora:admin-authenticated', fetchCompany);
  }, []);

  const logoUrl = company?.logoUrl;

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top Corporate Strip (Matching Reference GTS Enterprise Header) */}
      <div
        style={{
          background: 'rgba(7, 10, 18, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          padding: '0.4rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {/* Left: Contact Coordinates */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={12} color="var(--primary)" />
              <span>{company?.phone || '+91 93904 66320 / +91 40 4855 2244'}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={12} color="var(--accent)" />
              <span>{company?.email || 'info@nexoratech.com'}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={12} color="var(--status-success)" />
              <span>{company?.address || 'Madhapur, Hitec City, Hyderabad, India'}</span>
            </span>
          </div>

          {/* Right: Security & Portal Quick Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#93c5fd' }}>
              <ShieldCheck size={13} />
              <span>ISO 9001:2015 Verified</span>
            </span>
            {user ? (
              <Link to="/app/dashboard" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Applicant Workspace &rarr;
              </Link>
            ) : (
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Candidate Portal Access &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Corporate Navigation */}
      <div
        style={{
          background: 'rgba(11, 15, 25, 0.88)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Brand Identity */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: logoUrl ? 'transparent' : 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.25rem',
                boxShadow: logoUrl ? 'none' : '0 0 16px var(--primary-glow)',
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Nexora Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                'N'
              )}
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                  lineHeight: 1.1,
                }}
              >
                Nexora<span style={{ color: 'var(--accent)' }}>.</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Global Technology Services
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                    padding: '0.35rem 0.5rem',
                    borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Controls / Auth Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link
                  to={user.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard'}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <User size={15} />
                  <span>{user.fullName ? user.fullName.split(' ')[0] : 'Workspace'}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-outline"
                  title="Sign Out"
                  style={{ padding: '0.5rem', color: 'var(--text-muted)' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  <LogIn size={15} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}>
                  <UserPlus size={15} />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
