import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Building2, 
  Layers, 
  Briefcase, 
  Users, 
  FileCheck2, 
  CalendarClock, 
  Award, 
  MessageSquare, 
  History, 
  ArrowUpRight,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

import ScrollToTop from '../../components/common/ScrollToTop';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useToast } from '../../components/toast/ToastContext';
import NotificationBell from '../../features/notifications/NotificationBell';

let lastAdminAuthExpiredToast = 0;

export default function AdminLayout() {
  const { user, accessToken, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [logoUrl, setLogoUrl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState('recruitment');

  const navRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // 1. Route guard: check admin authorization
    if (!loading && (!accessToken || !user || user.role !== 'ADMIN')) {
      navigate('/login', { replace: true });
    }

    const handleAuthExpired = () => {
      const now = Date.now();
      if (now - lastAdminAuthExpiredToast > 12000) {
        lastAdminAuthExpiredToast = now;
        toast.error('Session timed out. Please sign in again.', { title: 'Session Expired' });
      }
      logout();
      navigate('/login?redirect=/admin/dashboard', { replace: true });
    };

    window.addEventListener('nexora:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('nexora:auth-expired', handleAuthExpired);
  }, [loading, accessToken, user, navigate, toast, logout]);

  useEffect(() => {
    // 2. Load public company branding
    import('../../features/public/company/companyApi.js').then(({ companyApi }) => {
      companyApi.getPublicProfile().then((data) => {
        if (data?.logoUrl) setLogoUrl(data.logoUrl);
      }).catch(() => {});
    });
  }, []);

  const handleSignOut = async () => {
    await logout();
    toast.info('Signed out of Administrator session.', { title: 'Session Ended' });
    navigate('/login', { replace: true });
  };

  const navGroups = [
    {
      id: 'overview',
      label: 'Overview',
      type: 'link',
      path: '/admin/dashboard',
      icon: BarChart3,
    },
    {
      id: 'company',
      label: 'Company',
      type: 'dropdown',
      icon: Building2,
      items: [
        { label: 'Company Info', path: '/admin/company', icon: Building2, desc: 'Corporate identity, coordinates & branding' },
        { label: 'Services Catalog', path: '/admin/services', icon: Layers, desc: 'Enterprise client capabilities & solutions' },
        { label: 'Inbound Enquiries', path: '/admin/enquiries', icon: MessageSquare, desc: 'Client requests & contact leads' },
      ],
    },
    {
      id: 'recruitment',
      label: 'Recruitment',
      type: 'dropdown',
      icon: Briefcase,
      items: [
        { label: 'Job Postings', path: '/admin/jobs', icon: Briefcase, desc: 'Publish, manage & track vacancies' },
        { label: 'Registered Applicants', path: '/admin/applicants', icon: Users, desc: 'Candidate talent directory & profiles' },
        { label: 'Applications & Review', path: '/admin/applications', icon: FileCheck2, desc: 'Recruitment evaluation & stage advancement' },
      ],
    },
    {
      id: 'hiring',
      label: 'Hiring',
      type: 'dropdown',
      icon: CalendarClock,
      items: [
        { label: 'Interviews', path: '/admin/interviews', icon: CalendarClock, desc: 'Schedule evaluation rounds' },
        { label: 'Offer Letters', path: '/admin/offers', icon: Award, desc: 'Draft, issue & track employment offers' },
      ],
    },
    {
      id: 'administration',
      label: 'Administration',
      type: 'dropdown',
      icon: History,
      items: [
        { label: 'Audit Logs', path: '/admin/activity', icon: History, desc: 'Immutable recruitment & operational decisions' },
      ],
    },
  ];

  const isGroupActive = (group) => {
    if (group.type === 'link') {
      return location.pathname === group.path;
    }
    return group.items?.some((item) => location.pathname === item.path);
  };

  if (loading || !accessToken || !user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <ScrollRestoration />
      <ScrollToTop />

      {/* ─────────────────────────────────────────────────────────────
          GLOBAL TOP NAVIGATION CONTAINER (Full Viewport Width)
      ───────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 999,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        }}
      >
        {/* ROW 1: BRAND HEADER, IDENTITY & GLOBAL CONTROLS */}
        <div
          style={{
            height: '66px',
            borderBottom: '1px solid #F1F5F9',
            padding: '0 clamp(1rem, 2.5vw, 2.5rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Left: Brand & Admin Console Identifier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: logoUrl ? '#FFFFFF' : 'var(--gradient-brand)',
                  border: logoUrl ? '1px solid #E2E8F0' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                  flexShrink: 0,
                }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  'N'
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', lineHeight: 1.15 }}>
                  Nexora<span style={{ color: '#2563EB' }}>.</span>
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, letterSpacing: '0.04em' }}>
                  TECHNOLOGIES
                </span>
              </div>
            </Link>

            <span
              className="badge badge-primary hide-mobile"
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.2rem 0.65rem',
                letterSpacing: '0.04em',
                borderRadius: '6px',
              }}
            >
              ADMIN CONSOLE
            </span>
          </div>

          {/* Right: Identity, Actions & Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Public Website Link */}
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary hide-mobile"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              title="Open public website in a new tab"
            >
              <span>Public Website</span>
              <ArrowUpRight size={14} />
            </Link>

            <NotificationBell role="ADMIN" />

            {/* Administrator Account Info Badge */}
            <div
              className="hide-tablet"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#2563EB',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                A
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0F172A', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName || user?.email || 'Administrator'}
              </div>
              <span
                style={{
                  background: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '9999px',
                  border: '1px solid #BFDBFE',
                }}
              >
                Super Admin
              </span>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="btn btn-outline hide-mobile"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', gap: '0.4rem', color: '#DC2626', borderColor: '#FECACA' }}
              title="Sign out of Administrator Console"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="admin-menu-toggle-btn"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: mobileMenuOpen ? '#EFF6FF' : '#FFFFFF',
                color: '#0F172A',
                cursor: 'pointer',
              }}
              aria-label="Toggle Admin Navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} color="#2563EB" /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ROW 2: MODERN HORIZONTAL TOP NAVIGATION (Desktop >= 1024px) */}
        <nav
          ref={navRef}
          className="admin-desktop-topnav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0 clamp(1rem, 2.5vw, 2.5rem)',
            background: '#FFFFFF',
            position: 'relative',
          }}
        >
          {navGroups.map((group) => {
            const active = isGroupActive(group);
            const isOpen = activeDropdown === group.id;
            const Icon = group.icon;

            if (group.type === 'link') {
              return (
                <NavLink
                  key={group.id}
                  to={group.path}
                  style={({ isActive }) => ({
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#2563EB' : '#475569',
                    borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                    background: 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={16} />
                  <span>{group.label}</span>
                </NavLink>
              );
            }

            // Dropdown Group
            return (
              <div key={group.id} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(isOpen ? null : group.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: active || isOpen ? 700 : 600,
                    color: active || isOpen ? '#2563EB' : '#475569',
                    border: 'none',
                    borderBottom: active ? '2px solid #2563EB' : '2px solid transparent',
                    background: isOpen ? '#F8FAFC' : 'transparent',
                    cursor: 'pointer',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.15s ease',
                  }}
                  aria-expanded={isOpen}
                >
                  <Icon size={16} />
                  <span>{group.label}</span>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      opacity: 0.75,
                    }}
                  />
                </button>

                {/* Dropdown Menu Popover */}
                {isOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      width: '280px',
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
                      padding: '0.5rem',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isItemActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setActiveDropdown(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            padding: '0.65rem 0.75rem',
                            borderRadius: '8px',
                            background: isItemActive ? '#EFF6FF' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              background: isItemActive ? '#2563EB' : '#F1F5F9',
                              color: isItemActive ? '#FFFFFF' : '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          >
                            <ItemIcon size={15} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: isItemActive ? 700 : 600,
                                color: isItemActive ? '#2563EB' : '#0F172A',
                                lineHeight: 1.25,
                              }}
                            >
                              {item.label}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.15rem', lineHeight: 1.3 }}>
                              {item.desc}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ─────────────────────────────────────────────────────────────
            MOBILE NAVIGATION DRAWER (< 1024px)
        ───────────────────────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div
            className="admin-mobile-drawer"
            style={{
              position: 'fixed',
              top: '66px',
              left: 0,
              right: 0,
              bottom: 0,
              background: '#FFFFFF',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: '1.25rem 1rem',
              borderTop: '1px solid #E2E8F0',
              boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              {navGroups.map((group) => {
                const Icon = group.icon;
                const isExpanded = mobileExpandedGroup === group.id;

                if (group.type === 'link') {
                  const isActive = location.pathname === group.path;
                  return (
                    <Link
                      key={group.id}
                      to={group.path}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: isActive ? '#EFF6FF' : '#F8FAFC',
                        border: isActive ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                        color: isActive ? '#2563EB' : '#0F172A',
                        fontWeight: isActive ? 700 : 600,
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Icon size={18} color={isActive ? '#2563EB' : '#475569'} />
                        <span>{group.label}</span>
                      </div>
                      <ChevronRight size={16} color="#94A3B8" />
                    </Link>
                  );
                }

                // Dropdown accordion section
                const groupActive = isGroupActive(group);
                return (
                  <div
                    key={group.id}
                    style={{
                      border: groupActive ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: '#FFFFFF',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setMobileExpandedGroup(isExpanded ? null : group.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        background: groupActive ? '#EFF6FF' : '#F8FAFC',
                        border: 'none',
                        color: groupActive ? '#2563EB' : '#0F172A',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Icon size={18} color={groupActive ? '#2563EB' : '#475569'} />
                        <span>{group.label}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s',
                          color: '#64748B',
                        }}
                      />
                    </button>

                    {isExpanded && (
                      <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', background: '#FFFFFF' }}>
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isItemActive = location.pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setMobileMenuOpen(false)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 0.85rem',
                                borderRadius: '8px',
                                background: isItemActive ? '#EFF6FF' : 'transparent',
                                color: isItemActive ? '#2563EB' : '#334155',
                                fontWeight: isItemActive ? 700 : 500,
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                              }}
                            >
                              <ItemIcon size={16} color={isItemActive ? '#2563EB' : '#64748B'} />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Drawer Footer Actions */}
            <div style={{ paddingTop: '1.25rem', marginTop: '1.25rem', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem', background: '#F8FAFC', borderRadius: '8px' }}>
                <ShieldCheck size={18} color="#059669" />
                <div style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 600 }}>{user?.email || 'admin@nexoratech.com'}</div>
              </div>

              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
              >
                <span>View Public Website</span>
                <ArrowUpRight size={14} />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', background: '#DC2626', borderColor: '#DC2626' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT WORKSPACE (Full Viewport Width, Zero Sidebar Spacing)
      ───────────────────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1600px',
          margin: '0 auto',
          padding: 'clamp(1.25rem, 2.5vw, 2.25rem) clamp(1rem, 2.5vw, 2rem)',
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        <Outlet />
      </main>

      {/* Embedded CSS for Top Navigation Media Queries */}
      <style>{`
        @media (max-width: 1023px) {
          .admin-desktop-topnav {
            display: none !important;
          }
          .admin-menu-toggle-btn {
            display: inline-flex !important;
          }
          .hide-tablet {
            display: none !important;
          }
        }
        @media (min-width: 1024px) {
          .admin-desktop-topnav {
            display: flex !important;
          }
          .admin-menu-toggle-btn {
            display: none !important;
          }
          .admin-mobile-drawer {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
