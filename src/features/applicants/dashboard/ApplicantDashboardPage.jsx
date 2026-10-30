import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  Clock, 
  CheckCircle, 
  CalendarClock, 
  Award, 
  XCircle, 
  RotateCcw,
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  Eye,
  Building,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { applicationsApi } from '../applications/applicationsApi';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', badgeClass: 'badge-primary', color: '#2563EB' },
  UNDER_REVIEW: { label: 'Under Review', badgeClass: 'badge-warning', color: '#D97706' },
  SHORTLISTED: { label: 'Shortlisted', badgeClass: 'badge-info', color: '#06B6D4' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', badgeClass: 'badge-info', color: '#7C3AED' },
  SELECTED: { label: 'Selected', badgeClass: 'badge-success', color: '#059669' },
  OFFER_EXTENDED: { label: 'Selected', badgeClass: 'badge-success', color: '#059669' },
  HIRED: { label: 'Hired', badgeClass: 'badge-success', color: '#059669' },
  REJECTED: { label: 'Rejected', badgeClass: 'badge-danger', color: '#DC2626' },
  WITHDRAWN: { label: 'Withdrawn', badgeClass: 'badge-neutral', color: '#64748B' },
};

export default function ApplicantDashboardPage() {
  const { user, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    applicant: null,
    summary: {
      totalApplications: 0,
      submitted: 0,
      underReview: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      rejected: 0,
      withdrawn: 0,
    },
    recentApplications: [],
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationsApi.getApplicantDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load applicant dashboard metrics:', err);
      setError(err.message || 'Unable to retrieve dashboard information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    loadDashboard();

    const handleFocus = () => loadDashboard();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadDashboard();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // Auto-sync dashboard every 12 seconds when active
    const syncInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadDashboard();
      }
    }, 12000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(syncInterval);
    };
  }, [accessToken]);

  const candidateName = dashboardData.applicant?.fullName || user?.fullName || 'Candidate';
  const summary = dashboardData.summary || {};
  const recentApps = dashboardData.recentApplications || [];

  const summaryCards = [
    {
      label: 'Total Applications',
      count: summary.totalApplications || 0,
      icon: Briefcase,
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      status: 'ALL',
      path: '/app/applications?status=ALL',
      description: 'View all submitted job applications',
    },
    {
      label: 'Submitted',
      count: summary.submitted || 0,
      icon: FileText,
      color: '#3B82F6',
      bg: '#EFF6FF',
      border: '#DBEAFE',
      status: 'SUBMITTED',
      path: '/app/applications?status=SUBMITTED',
      description: 'View applications in submitted status',
    },
    {
      label: 'Under Review',
      count: summary.underReview || 0,
      icon: Clock,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      status: 'UNDER_REVIEW',
      path: '/app/applications?status=UNDER_REVIEW',
      description: 'View applications currently under HR review',
    },
    {
      label: 'Shortlisted',
      count: summary.shortlisted || 0,
      icon: CheckCircle,
      color: '#0891B2',
      bg: '#ECFEFF',
      border: '#A5F3FC',
      status: 'SHORTLISTED',
      path: '/app/applications?status=SHORTLISTED',
      description: 'View shortlisted applications',
    },
    {
      label: 'Interview Scheduled',
      count: summary.interview || 0,
      icon: CalendarClock,
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      status: 'INTERVIEW_SCHEDULED',
      path: '/app/applications?status=INTERVIEW_SCHEDULED',
      description: 'View scheduled interview stages',
    },
    {
      label: 'Selected',
      count: summary.selected || summary.offered || 0,
      icon: Award,
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      status: 'SELECTED',
      path: '/app/applications?status=SELECTED',
      description: 'View selected applications',
    },
    {
      label: 'Rejected',
      count: summary.rejected || 0,
      icon: XCircle,
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
      status: 'REJECTED',
      path: '/app/applications?status=REJECTED',
      description: 'View archived / rejected applications',
    },
    {
      label: 'Withdrawn',
      count: summary.withdrawn || 0,
      icon: RotateCcw,
      color: '#475569',
      bg: '#F8FAFC',
      border: '#E2E8F0',
      status: 'WITHDRAWN',
      path: '/app/applications?status=WITHDRAWN',
      description: 'View candidate-withdrawn submissions',
    },
  ];

  return (
    <div style={{ width: '100%', maxWidth: '1360px', margin: '0 auto' }}>
      {/* 1. Welcome Section */}
      <div
        className="card"
        style={{
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 60%, #F0FDFA 100%)',
          border: '1px solid #BFDBFE',
          borderRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <Sparkles size={14} />
            <span>Applicant Career Hub</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.15rem)', marginBottom: '0.4rem', fontWeight: 800, color: '#0F172A' }}>
            Welcome back, {candidateName}!
          </h1>
          <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
            Track your job submission lifecycles, review real-time recruitment updates, and manage your attached professional credentials.
          </p>
        </div>

        <div className="btn-group-responsive" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/careers" className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}>
            <span>Browse Jobs</span>
          </Link>
          <Link to="/app/applications" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}>
            <span>View My Applications</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Error state with retry */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#B91C1C', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
          </div>
          <button type="button" onClick={loadDashboard} className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 2. Interactive Application Summary Cards (8 Clickable KPI Metrics) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Application Statistics
            </h2>
            <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0.2rem 0 0' }}>
              Click any metric card below to view matching filtered applications.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '0.35rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Refresh live metrics from server"
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              <span>{loading ? 'Refreshing...' : 'Refresh Metrics'}</span>
            </button>
            <Link
              to="/app/applications"
              style={{
                fontSize: '0.85rem',
                color: '#2563EB',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
              }}
            >
              <span>View all</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div
          className="kpi-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '1rem',
          }}
        >
          {summaryCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link
                key={i}
                to={stat.path}
                className="kpi-summary-card card"
                role="button"
                tabIndex={0}
                aria-label={`${stat.label}: ${stat.count} applications. Click to open filtered applications list.`}
                title={`Filter applications by ${stat.label}`}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#FFFFFF',
                  border: `1px solid ${stat.border}`,
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  textDecoration: 'none',
                  color: 'inherit',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '0.35rem' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                    {loading ? '-' : stat.count}
                  </div>
                  <div className="kpi-action-hint" style={{ fontSize: '0.72rem', color: stat.color, fontWeight: 600, marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: 0.85 }}>
                    <span>Explore</span>
                    <ArrowRight size={11} />
                  </div>
                </div>
                <div
                  className="kpi-icon-badge"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: stat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                    flexShrink: 0,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <Icon size={22} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Recent Applications Section */}
      <div className="glass-panel" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem' }}>
              Recent Applications
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
              Latest 5 applications submitted from your applicant account
            </p>
          </div>
          <Link to="/app/applications" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <span>View All Applications</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw className="animate-spin" size={28} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.9rem', margin: 0 }}>Loading your live applications...</p>
          </div>
        ) : recentApps.length === 0 ? (
          /* Empty Dashboard State */
          <div
            style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Briefcase size={30} />
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
              No Applications Submitted Yet
            </h4>
            <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              You haven't submitted any job applications yet. Visit the Careers section to explore open roles, apply with your stored resume, and track your candidacy here.
            </p>
            <Link to="/careers" className="btn btn-primary" style={{ padding: '0.65rem 1.35rem', fontSize: '0.875rem' }}>
              <span>Browse Open Positions</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet View */}
            <div className="desktop-table-view table-responsive">
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Reference</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Job Title</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Location</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Submission Date</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map((app) => {
                    const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
                    return (
                      <tr key={app.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                          {app.referenceNumber}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#0F172A' }}>
                          {app.jobTitle}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748B' }}>
                          {app.location} {app.workMode && `(${app.workMode})`}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.85rem' }}>
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className={`badge ${statusConfig.badgeClass}`} style={{ fontSize: '0.72rem' }}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <Link
                            to={`/app/applications?openId=${app.id}`}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical Cards View (Natural Vertical Scroll) */}
            <div className="mobile-cards-view">
              {recentApps.map((app) => {
                const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
                return (
                  <div
                    key={`card-${app.id}`}
                    className="card"
                    style={{
                      padding: '1.15rem',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#2563EB', fontWeight: 700 }}>
                          {app.referenceNumber}
                        </span>
                        <h4 style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                          {app.jobTitle}
                        </h4>
                      </div>
                      <span className={`badge ${statusConfig.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.8rem' }}>
                      <MapPin size={14} color="#94A3B8" />
                      <span>{app.location}</span>
                      <span>•</span>
                      <span>{new Date(app.submittedAt).toLocaleDateString()}</span>
                    </div>

                    <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
                      <Link
                        to={`/app/applications?openId=${app.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Interactive KPI Card Styles (Hover, Focus, Active, Transitions) */}
      <style>{`
        .kpi-summary-card {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease !important;
          user-select: none;
        }
        .kpi-summary-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 24px -4px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.04) !important;
          border-color: #93C5FD !important;
        }
        .kpi-summary-card:hover .kpi-icon-badge {
          transform: scale(1.08);
        }
        .kpi-summary-card:hover .kpi-action-hint {
          opacity: 1 !important;
        }
        .kpi-summary-card:focus-visible {
          outline: 3px solid #2563EB !important;
          outline-offset: 3px !important;
          transform: translateY(-2px) !important;
        }
        .kpi-summary-card:active {
          transform: translateY(-1px) scale(0.99) !important;
          box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08) !important;
        }
      `}</style>
    </div>
  );
}

