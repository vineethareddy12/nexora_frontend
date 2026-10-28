import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, ScrollRestoration } from 'react-router-dom';
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
  Lock
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import ScrollToTop from '../../components/common/ScrollToTop';

export default function ApplicantLayout() {
  const { user, accessToken, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!loading && (!accessToken || !user)) {
      navigate('/login', { replace: true });
    }
  }, [loading, accessToken, user, navigate]);

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
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <ScrollRestoration />
      <ScrollToTop />
      {/* Top Navigation Bar (Full Width, No Sidebar) */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(11, 15, 25, 0.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
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
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                }}
              >
                N
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)', lineHeight: 1.1 }}>
                  Nexora
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Applicant Hub
                </div>
              </div>
            </Link>

            {/* Top Navigation Tabs */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                      background: isActive ? 'var(--primary)' : 'transparent',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/careers"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span>Explore Jobs</span>
              <ExternalLink size={13} />
            </Link>

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
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--gradient-brand)',
                    color: '#fff',
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
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </div>
                </div>
                <ChevronDown size={15} style={{ color: 'var(--text-dim)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {/* Dropdown Content */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '260px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
                    padding: '0.5rem',
                    zIndex: 101,
                  }}
                >
                  {/* User identity card */}
                  <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{displayName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', wordBreak: 'break-all', marginTop: '0.15rem' }}>{displayEmail}</div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
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
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                      }}
                    >
                      <User size={15} color="var(--primary)" />
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
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                      }}
                    >
                      <Lock size={15} color="var(--accent)" />
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
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                      }}
                    >
                      <ArrowLeft size={15} color="var(--text-muted)" />
                      <span>Back to Public Website</span>
                    </Link>

                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.35rem 0' }} />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        color: '#f87171',
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
          </div>
        </div>
      </header>

      {/* Main Content Workspace (Full Width, Wide Layout) */}
      <main style={{ flex: 1, width: '100%', maxWidth: '1360px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
