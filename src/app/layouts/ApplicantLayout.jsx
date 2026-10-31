import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation, ScrollRestoration } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Briefcase, 
  Calendar, 
  Award, 
  Settings, 
  ArrowLeft,
  Bell,
  ChevronDown,
  LogOut,
  ExternalLink,
  Lock,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import ScrollToTop from '../../components/common/ScrollToTop';
import NotificationBell from '../../features/notifications/NotificationBell';

export default function ApplicantLayout() {
  const { user, accessToken, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && (!accessToken || !user)) {
      navigate('/login', { replace: true });
    }

    const handleAuthExpired = () => {
      logout();
      navigate('/login', { replace: true });
    };

    window.addEventListener('nexora:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('nexora:auth-expired', handleAuthExpired);
  }, [loading, accessToken, user, navigate, logout]);

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Applications', path: '/app/applications', icon: Briefcase },
    { label: 'Documents', path: '/app/documents', icon: FileText },
    { label: 'Interviews', path: '/app/interviews', icon: Calendar },
    { label: 'Offers', path: '/app/offers', icon: Award },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
  const displayName = user?.fullName || 'Candidate';
  const displayEmail = user?.email || 'applicant@nexora.com';

  if (loading || !accessToken || !user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <ScrollRestoration />
      <ScrollToTop />

      {/* Top Light Navigation Bar (Full Width, No Sidebar) */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          {/* Left: Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--gradient-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                N
              </div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    color: '#0F172A',
                    lineHeight: 1.1,
                  }}
                >
                  Nexora<span style={{ color: '#2563EB' }}>.</span>
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: '#2563EB',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  Applicant Hub
                </div>
              </div>
            </Link>

            {/* Top Navigation Tabs */}
            <nav className="applicant-desktop-nav" style={{ alignItems: 'center', gap: '0.5rem' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#2563EB' : '#475569',
                      background: isActive ? '#EFF6FF' : 'transparent',
                      border: isActive ? '1px solid #BFDBFE' : '1px solid transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    })}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions, Public Link & Real Profile Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/careers"
              className="hide-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                color: '#475569',
                textDecoration: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontWeight: 500,
              }}
            >
              <span>Explore Jobs</span>
              <ExternalLink size={13} />
            </Link>

            <NotificationBell role="APPLICANT" />

            {/* Profile Dropdown Menu */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  color: '#0F172A',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--gradient-brand)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {userInitial}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      maxWidth: '140px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#0F172A',
                    }}
                  >
                    {displayName}
                  </div>
                </div>
                <ChevronDown
                  size={15}
                  style={{
                    color: '#64748B',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {/* Dropdown Content */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '260px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                    padding: '0.65rem',
                    zIndex: 101,
                  }}
                >
                  {/* User identity card */}
                  <div
                    style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid #F1F5F9',
                      marginBottom: '0.4rem',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{displayName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', wordBreak: 'break-all', marginTop: '0.15rem' }}>
                      {displayEmail}
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                        {user?.role || 'APPLICANT'}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown navigation items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <Link
                      to="/app/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#0F172A',
                        textDecoration: 'none',
                      }}
                    >
                      <User size={15} color="#2563EB" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/app/profile?tab=password"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#0F172A',
                        textDecoration: 'none',
                      }}
                    >
                      <Lock size={15} color="#06B6D4" />
                      <span>Change Password</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#475569',
                        textDecoration: 'none',
                      }}
                    >
                      <ArrowLeft size={15} color="#64748B" />
                      <span>Back to Public Website</span>
                    </Link>

                    <div style={{ height: '1px', background: '#E2E8F0', margin: '0.35rem 0' }} />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#DC2626',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="applicant-mobile-menu-btn"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.45rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#0F172A',
                cursor: 'pointer',
              }}
              aria-label="Toggle Applicant Navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="applicant-mobile-drawer"
            style={{
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08)',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#2563EB' : '#0F172A',
                    background: isActive ? '#EFF6FF' : 'transparent',
                    border: isActive ? '1px solid #BFDBFE' : '1px solid transparent',
                    textDecoration: 'none',
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={15} color="#94A3B8" />
                </NavLink>
              );
            })}

            <div style={{ height: '1px', background: '#E2E8F0', margin: '0.35rem 0' }} />

            <Link
              to="/careers"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#475569',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ExternalLink size={16} />
                <span>Explore Open Jobs</span>
              </div>
              <ChevronRight size={15} color="#94A3B8" />
            </Link>

            <Link
              to="/app/profile"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#475569',
                textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <User size={16} />
                <span>My Profile</span>
              </div>
              <ChevronRight size={15} color="#94A3B8" />
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#DC2626',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                cursor: 'pointer',
                marginTop: '0.5rem',
                width: '100%',
                fontWeight: 600,
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Workspace */}
      <main style={{ flex: 1, width: '100%', maxWidth: '1360px', margin: '0 auto', padding: 'clamp(1.25rem, 3vw, 2.5rem) clamp(0.75rem, 2.5vw, 1.5rem)' }}>
        <Outlet />
      </main>

      {/* Embedded Responsive Media Queries */}
      <style>{`
        @media (max-width: 959px) {
          .applicant-desktop-nav {
            display: none !important;
          }
          .applicant-mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @media (min-width: 960px) {
          .applicant-desktop-nav {
            display: flex !important;
          }
          .applicant-mobile-menu-btn {
            display: none !important;
          }
          .applicant-mobile-drawer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
