import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  FileCheck2, 
  Clock, 
  CheckCircle, 
  CalendarClock, 
  Award, 
  XCircle, 
  ArrowRight, 
  RefreshCw,
  Eye,
  Building2,
  Layers,
  MessageSquare,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { adminReviewApi } from '../review/adminReviewApi';
import { clientCache } from '../../../core/cache/clientCache';
import { CardSkeleton, TableSkeleton, RefreshBadge, ErrorState } from '../../../components/common/LoadingStates';

const STATUS_BADGES = {
  SUBMITTED: { label: 'Submitted', badgeClass: 'badge-primary' },
  UNDER_REVIEW: { label: 'Under Review', badgeClass: 'badge-warning' },
  SHORTLISTED: { label: 'Shortlisted', badgeClass: 'badge-info' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', badgeClass: 'badge-primary' },
  REJECTED: { label: 'Rejected', badgeClass: 'badge-danger' },
  OFFER_EXTENDED: { label: 'Offer Extended', badgeClass: 'badge-success' },
  HIRED: { label: 'Hired', badgeClass: 'badge-success' },
  WITHDRAWN: { label: 'Withdrawn', badgeClass: 'badge-neutral' },
};

export default function AdminDashboardPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const cacheKey = 'admin_dashboard';
  const cachedData = clientCache.get(cacheKey);

  const [loading, setLoading] = useState(!cachedData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(() => cachedData || {
    summary: {
      totalApplicants: 0,
      totalApplications: 0,
      submitted: 0,
      underReview: 0,
      shortlisted: 0,
      interview: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
      withdrawn: 0,
      totalJobs: 0,
      openVacancies: 0,
    },
    recentApplications: [],
  });

  const loadData = async (isSilent = false) => {
    try {
      if (!isSilent && !dashboardData.summary.totalApplicants) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const data = await clientCache.fetchWithDedupe(
        cacheKey,
        () => adminReviewApi.getDashboard(),
        15000
      );

      if (data) {
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      if (!dashboardData.summary.totalApplicants) {
        setError(err.message || 'Unable to load administrative metrics.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(!!cachedData);

    const handleFocus = () => loadData(true);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadData(true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    const syncInterval = setInterval(() => {
      if (document.visibilityState === 'visible') loadData(true);
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(syncInterval);
    };
  }, [accessToken]);

  const summary = dashboardData.summary || {};
  const recentApplications = dashboardData.recentApplications || [];

  // Section 1: Job Management Analytics
  const jobKpis = [
    {
      label: 'Total Job Postings',
      count: summary.totalJobs || 0,
      icon: Briefcase,
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      path: '/admin/jobs',
      description: 'All created vacancies & roles',
    },
    {
      label: 'Open Jobs',
      count: summary.openJobs || summary.openVacancies || 0,
      icon: CheckCircle,
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      path: '/admin/jobs?status=PUBLISHED',
      description: 'Active & published positions',
    },
    {
      label: 'Closed Jobs',
      count: summary.closedJobs || 0,
      icon: XCircle,
      color: '#64748B',
      bg: '#F8FAFC',
      border: '#E2E8F0',
      path: '/admin/jobs?status=CLOSED',
      description: 'Filled or expired positions',
    },
  ];

  // Section 2: Applicant & Application Analytics
  const applicationKpis = [
    {
      label: 'Total Applicants',
      count: summary.totalApplicants || 0,
      icon: Users,
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      path: '/admin/applicants',
      description: 'Registered candidate talent pool',
    },
    {
      label: 'Total Applications',
      count: summary.totalApplications || 0,
      icon: FileCheck2,
      color: '#0891B2',
      bg: '#ECFEFF',
      border: '#A5F3FC',
      path: '/admin/applications?status=ALL',
      description: 'All submitted applications',
    },
    {
      label: 'Submitted',
      count: summary.submitted || 0,
      icon: Briefcase,
      color: '#3B82F6',
      bg: '#EFF6FF',
      border: '#DBEAFE',
      path: '/admin/applications?status=SUBMITTED',
      description: 'New pending review',
    },
    {
      label: 'Under Review',
      count: summary.underReview || 0,
      icon: Clock,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      path: '/admin/applications?status=UNDER_REVIEW',
      description: 'Active candidate evaluations',
    },
    {
      label: 'Shortlisted',
      count: summary.shortlisted || 0,
      icon: CheckCircle,
      color: '#0D9488',
      bg: '#F0FDFA',
      border: '#99F6E4',
      path: '/admin/applications?status=SHORTLISTED',
      description: 'Qualified candidates',
    },
    {
      label: 'Interview Scheduled',
      count: summary.interview || 0,
      icon: CalendarClock,
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      path: '/admin/applications?status=INTERVIEW_SCHEDULED',
      description: 'Active interview stages',
    },
    {
      label: 'Selected',
      count: summary.selected || summary.offered || 0,
      icon: Award,
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      path: '/admin/applications?status=SELECTED',
      description: 'Approved & selected candidates',
    },
    {
      label: 'Rejected',
      count: summary.rejected || 0,
      icon: XCircle,
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
      path: '/admin/applications?status=REJECTED',
      description: 'Unsuccessful applications',
    },
    {
      label: 'Withdrawn',
      count: summary.withdrawn || 0,
      icon: RefreshCw,
      color: '#64748B',
      bg: '#F8FAFC',
      border: '#E2E8F0',
      path: '/admin/applications?status=WITHDRAWN',
      description: 'Withdrawn by applicant',
    },
  ];

  // Section 3: Offer Analytics
  const offerKpis = [
    {
      label: 'Offers Issued',
      count: summary.offersIssued || 0,
      icon: Award,
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      path: '/admin/offers?status=ISSUED',
      description: 'Official employment offers issued',
    },
    {
      label: 'Offers Accepted',
      count: summary.offersAccepted || 0,
      icon: CheckCircle,
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      path: '/admin/offers?status=ACCEPTED',
      description: 'Candidates accepted offer terms',
    },
  ];

  const renderKpiCard = (kpi, key) => {
    const Icon = kpi.icon;
    return (
      <Link
        key={key}
        to={kpi.path}
        className="kpi-summary-card card"
        role="button"
        tabIndex={0}
        aria-label={`${kpi.label}: ${kpi.count}. Click to view matching records.`}
        title={kpi.description}
        style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          border: `1px solid ${kpi.border}`,
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          textDecoration: 'none',
          color: 'inherit',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '0.35rem' }}>
            {kpi.label}
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
            {kpi.count}
          </div>
          <div style={{ fontSize: '0.72rem', color: kpi.color, fontWeight: 600, marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
            background: kpi.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: kpi.color,
            flexShrink: 0,
            transition: 'transform 0.18s ease',
          }}
        >
          <Icon size={22} />
        </div>
      </Link>
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* 1. Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.65rem', borderRadius: '16px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ShieldAlert size={14} />
            <span>Recruitment Command Center</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
            Recruitment & Operations Dashboard
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Live metrics, applicant profiles, and stage-by-stage candidate review across Nexora Technologies.
          </p>
        </div>

        <RefreshBadge isRefreshing={isRefreshing} onRefresh={() => loadData(true)} />
      </div>

      {/* Error Banner */}
      {error && !dashboardData.summary.totalApplicants && (
        <ErrorState
          title="Unable to load dashboard metrics"
          message={error}
          onRetry={() => loadData(false)}
        />
      )}

      {/* 2. Job Management Analytics */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Briefcase size={20} color="#2563EB" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Job Management Analytics
          </h2>
        </div>
        <div
          className="kpi-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '1rem',
          }}
        >
          {jobKpis.map((kpi, idx) => renderKpiCard(kpi, `job-${idx}`))}
        </div>
      </div>

      {/* 3. Applicant & Application Analytics */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Users size={20} color="#0891B2" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Applicant & Application Analytics
          </h2>
        </div>
        <div
          className="kpi-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '1rem',
          }}
        >
          {applicationKpis.map((kpi, idx) => renderKpiCard(kpi, `app-${idx}`))}
        </div>
      </div>

      {/* 4. Offer Analytics */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Award size={20} color="#059669" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Offer Analytics
          </h2>
        </div>
        <div
          className="kpi-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '1rem',
          }}
        >
          {offerKpis.map((kpi, idx) => renderKpiCard(kpi, `offer-${idx}`))}
        </div>
      </div>

      {/* 3. Recent Applications Table & Mobile Card View */}
      <div className="card" style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem' }}>
              Recently Submitted Applications
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748B', margin: 0 }}>
              Latest candidate submissions awaiting review or stage advancement.
            </p>
          </div>
          <Link
            to="/admin/applications"
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>View All Applications</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading && !dashboardData.summary.totalApplicants ? (
          <TableSkeleton rows={4} columns={6} />
        ) : recentApplications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
            <FileCheck2 size={36} color="#CBD5E1" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No applications submitted yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-table-view table-responsive" style={{ margin: 0 }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Reference #</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Applicant</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Job Title</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Applied Date</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => {
                    const badge = STATUS_BADGES[app.status] || STATUS_BADGES.SUBMITTED;
                    return (
                      <tr key={app.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>
                          {app.referenceNumber}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{app.candidateName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{app.candidateEmail}</div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 500, color: '#0F172A' }}>
                          {app.jobTitle}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.85rem' }}>
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className={`badge ${badge.badgeClass}`} style={{ fontSize: '0.72rem' }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <Link
                            to={`/admin/applications?openId=${app.id}`}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Eye size={14} />
                            <span>Review</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical Cards View */}
            <div className="mobile-cards-view" style={{ flexDirection: 'column', gap: '0.85rem' }}>
              {recentApplications.map((app) => {
                const badge = STATUS_BADGES[app.status] || STATUS_BADGES.SUBMITTED;
                return (
                  <div
                    key={`m-app-${app.id}`}
                    className="card"
                    style={{
                      padding: '1rem',
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
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                          {app.referenceNumber}
                        </span>
                        <h4 style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                          {app.candidateName}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{app.jobTitle}</div>
                      </div>
                      <span className={`badge ${badge.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                        {badge.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {new Date(app.submittedAt).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/admin/applications?openId=${app.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Eye size={13} />
                        <span>Review</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 4. Quick Administrative Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <Briefcase size={22} color="#2563EB" />
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Job Vacancy Management</h4>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Publish open job postings to careers, adjust qualifications, manage deadlines, or archive positions.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/admin/jobs" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Manage Vacancies
            </Link>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <Users size={22} color="#0D9488" />
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Applicant Directory</h4>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Search registered candidate records, evaluate technical skill sets, and review contact coordinates.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/admin/applicants" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              View Applicants
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}