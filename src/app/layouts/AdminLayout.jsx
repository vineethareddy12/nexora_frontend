import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  Menu,
  X
} from 'lucide-react';

import ScrollToTop from '../../components/common/ScrollToTop';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useToast } from '../../components/toast/ToastContext';

let lastAdminAuthExpiredToast = 0;

export default function AdminLayout() {
  const { user, accessToken, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [logoUrl, setLogoUrl] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
      navigate('/login?redirect=/admin/jobs', { replace: true });
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

  const adminMenuItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: BarChart3 },
    { label: 'Company Info', path: '/admin/company', icon: Building2 },
    { label: 'Services', path: '/admin/services', icon: Layers },
    { label: 'Job Postings', path: '/admin/jobs', icon: Briefcase },
    { label: 'Applicants', path: '/admin/applicants', icon: Users },
    { label: 'Applications', path: '/admin/applications', icon: FileCheck2 },
    { label: 'Interviews', path: '/admin/interviews', icon: CalendarClock },
    { label: 'Offer Letters', path: '/admin/offers', icon: Award },
    { label: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { label: 'Audit Logs', path: '/admin/activity', icon: History },
  ];

  if (loading || !accessToken || !user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      <ScrollRestoration />
      <ScrollToTop />

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Light Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''}`}
        style={{
          width: '270px',
          background: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Brand & Security Chip */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: logoUrl ? '#FFFFFF' : 'var(--gradient-brand)',
                  border: logoUrl ? '1px solid #E2E8F0' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  'N'
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.15rem', color: '#0F172A' }}>
                Nexora<span style={{ color: '#2563EB' }}>.</span>
              </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                Admin
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="admin-sidebar-close"
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  transition: 'all 0.15s ease',
                }}
                aria-label="Close Sidebar"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
            Recruitment & Company Ops
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.75rem 1rem',
                  minHeight: '44px',
                  borderRadius: '8px',
                  fontSize: '0.925rem',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#2563EB' : '#1E293B',
                  background: isActive ? '#EFF6FF' : 'transparent',
                  border: isActive ? '1px solid #BFDBFE' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: '1.25rem',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#FFFFFF',
          }}
        >
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#64748B',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} />
            <span>Public Website</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false);
              handleSignOut();
            }}
            title="Sign Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 clamp(1rem, 2.5vw, 2rem)',
            background: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="admin-menu-toggle"
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
              aria-label="Open Admin Menu"
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={16} color="#2563EB" />
              <span className="admin-header-title-text" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
                Secure Admin Console
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              className="admin-header-email"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.825rem',
                color: '#64748B',
              }}
            >
              <ShieldCheck size={15} color="#059669" />
              <span>{user?.email || 'Administrator'}</span>
            </div>

            <div
              className="admin-header-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563EB' }}>Super Admin</span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="btn btn-outline"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem' }}
              title="Sign out of Admin"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Sub-view Content */}
        <main style={{ padding: 'clamp(1rem, 2.5vw, 2rem) clamp(0.75rem, 2vw, 1.5rem)', flex: 1, minWidth: 0, background: '#F8FAFC' }}>
          <Outlet />
        </main>
      </div>

      {/* Responsive Styles for Admin Sidebar Drawer & Controls */}
      <style>{`
        @media (max-width: 1023px) {
          .admin-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            bottom: 0;
            width: min(290px, 86vw) !important;
            background: #FFFFFF !important;
            z-index: 9999 !important;
            transform: translateX(-100%);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.25s;
            box-shadow: 6px 0 25px rgba(15, 23, 42, 0.25);
            visibility: hidden;
            pointer-events: none;
            overflow-y: auto;
          }
          .admin-sidebar-open {
            transform: translateX(0) !important;
            visibility: visible !important;
            pointer-events: auto !important;
            z-index: 9999 !important;
          }
          .admin-sidebar-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.45);
            z-index: 9998 !important;
            cursor: pointer;
          }
          .admin-menu-toggle {
            display: inline-flex !important;
          }
          .admin-main-container {
            width: 100% !important;
          }
        }
        @media (min-width: 1024px) {
          .admin-sidebar {
            visibility: visible !important;
            pointer-events: auto !important;
            transform: none !important;
          }
          .admin-menu-toggle,
          .admin-sidebar-close,
          .admin-sidebar-backdrop {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .admin-header-email {
            display: none !important;
          }
        }
        @media (max-width: 500px) {
          .admin-header-badge {
            display: none !important;
          }
        }
        @media (max-width: 420px) {
          .admin-header-title-text {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
