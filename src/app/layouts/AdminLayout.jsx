import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

import ScrollToTop from '../../components/common/ScrollToTop';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useToast } from '../../components/toast/ToastContext';

export default function AdminLayout() {
  const { user, accessToken, loading, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    // 1. Route guard: check admin authorization
    if (!loading && (!accessToken || !user || user.role !== 'ADMIN')) {
      navigate('/login', { replace: true });
    }
  }, [loading, accessToken, user, navigate]);

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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <ScrollRestoration />
      <ScrollToTop />

      {/* Admin Sidebar */}
      <aside style={{
        width: '270px',
        background: '#0d1322',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50,
      }}>
        {/* Brand & Security Chip */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: logoUrl ? 'transparent' : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: '#fff',
                fontWeight: 800,
              }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  'N'
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>Nexora</span>
            </Link>
            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Admin</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recruitment & Company Ops</div>
        </div>

        {/* Navigation list */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                  transition: 'all 0.15s ease',
                })}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-dim)',
            fontSize: '0.85rem',
          }}>
            <ArrowLeft size={16} />
            <span>Public Website</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          background: 'rgba(13, 19, 34, 0.75)',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} color="var(--status-warning)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Secure Administrator Console</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>{user?.email || 'Administrator'}</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.3)',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f472b6' }}>Super Admin</span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="btn btn-outline"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
              title="Sign out of Admin"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Sub-view Content */}
        <main style={{ padding: '2rem', flex: 1, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
