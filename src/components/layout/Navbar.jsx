import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [company, setCompany] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
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

  // Listen for scroll to apply elevation shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const logoUrl = company?.logoUrl;

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        boxShadow: scrolled ? '0 4px 20px -2px rgba(15, 23, 42, 0.08)' : 'none',
        transition: 'box-shadow 0.25s ease',
      }}
    >
      {/* 1. Top Understated Contact Strip */}
      <div
        style={{
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          fontSize: '0.8rem',
          color: '#64748B',
          padding: '0.45rem 1.5rem',
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
            gap: '0.75rem',
          }}
        >
          {/* Coordinates */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={13} color="#2563EB" />
              <span>{company?.phone || '+91 93904 66320 / +91 40 4855 2244'}</span>
            </span>
            <span className="contact-strip-email" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={13} color="#06B6D4" />
              <span>{company?.email || 'info@nexoratech.com'}</span>
            </span>
            <span className="contact-strip-address" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={13} color="#059669" />
              <span>{company?.address || 'Madhapur, Hitec City, Hyderabad, India'}</span>
            </span>
          </div>

          {/* Quick Portal Action & Trust Verification */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              className="contact-strip-iso"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#2563EB',
                fontWeight: 600,
                fontSize: '0.75rem',
                background: '#EFF6FF',
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                border: '1px solid #BFDBFE',
              }}
            >
              <ShieldCheck size={13} />
              <span>ISO 9001:2015 Verified</span>
            </span>

            {user ? (
              <Link
                to={user.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard'}
                style={{ color: '#2563EB', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span>{user.role === 'ADMIN' ? 'Admin Suite' : 'Candidate Workspace'}</span>
                <ChevronRight size={13} />
              </Link>
            ) : (
              <Link
                to="/login"
                style={{ color: '#2563EB', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <span>Candidate Portal Access</span>
                <ChevronRight size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Light Corporate Navigation Bar */}
      <div
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
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
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: logoUrl ? '#FFFFFF' : 'var(--gradient-brand)',
                border: logoUrl ? '1px solid #E2E8F0' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0,
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={company?.companyName || 'Nexora Technologies Logo'}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                'N'
              )}
            </div>

            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: '#0F172A',
                  lineHeight: 1.1,
                }}
              >
                Nexora<span style={{ color: '#2563EB' }}>.</span>
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#64748B',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Global Technology Services
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '2rem',
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    fontSize: '0.925rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#2563EB' : '#0F172A',
                    padding: '0.5rem 0.25rem',
                    position: 'relative',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: '#2563EB',
                        borderRadius: '2px',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth / Action Controls */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            className="desktop-nav"
          >
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link
                  to={user.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard'}
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.875rem' }}
                >
                  <User size={15} />
                  <span>{user.fullName ? user.fullName.split(' ')[0] : 'Workspace'}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-outline"
                  title="Sign Out"
                  style={{ padding: '0.55rem 0.75rem', color: '#64748B' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline"
                  style={{ padding: '0.55rem 1.15rem', fontSize: '0.875rem' }}
                >
                  <LogIn size={15} color="#2563EB" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}
                >
                  <UserPlus size={15} />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              cursor: 'pointer',
            }}
            className="mobile-menu-btn"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08)',
          }}
          className="mobile-menu-drawer"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '1rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#2563EB' : '#0F172A',
                  padding: '0.65rem 0.5rem',
                  borderRadius: '6px',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{link.label}</span>
                <ChevronRight size={16} color={isActive ? '#2563EB' : '#94A3B8'} />
              </Link>
            );
          })}

          <div style={{ height: '1px', background: '#E2E8F0', margin: '0.5rem 0' }} />

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to={user.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard'}
                className="btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
                style={{ width: '100%' }}
              >
                <User size={16} />
                <span>Open {user.role === 'ADMIN' ? 'Admin Suite' : 'Workspace'}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Link
                to="/login"
                className="btn btn-outline"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={15} color="#2563EB" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus size={15} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Embedded Responsive Navigation Media Queries */}
      <style>{`
        @media (max-width: 768px) {
          .contact-strip-address {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .contact-strip-email,
          .contact-strip-iso {
            display: none !important;
          }
        }
        @media (min-width: 860px) and (max-width: 1024px) {
          .desktop-nav {
            gap: 1.15rem !important;
          }
        }
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-menu-drawer {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
