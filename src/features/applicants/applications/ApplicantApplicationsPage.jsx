import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  XCircle,
  ArrowRight,
  FileText,
  Award,
  AlertTriangle,
  Download,
  Loader2,
  Eye,
  Building,
  MapPin,
  X,
  ShieldAlert,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { applicationsApi } from './applicationsApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useToast } from '../../../components/toast/ToastContext';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', badgeClass: 'badge-primary' },
  UNDER_REVIEW: { label: 'Under Review', badgeClass: 'badge-warning' },
  SHORTLISTED: { label: 'Shortlisted', badgeClass: 'badge-info' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', badgeClass: 'badge-primary' },
  REJECTED: { label: 'Not Selected', badgeClass: 'badge-danger' },
  OFFER_EXTENDED: { label: 'Offer Extended', badgeClass: 'badge-success' },
  HIRED: { label: 'Hired', badgeClass: 'badge-success' },
  WITHDRAWN: { label: 'Withdrawn', badgeClass: 'badge-neutral' },
};

function normalizeStatusParam(status) {
  if (!status) return 'ALL';
  const s = status.trim().toUpperCase();
  if (s === 'ALL') return 'ALL';
  if (s === 'INTERVIEW') return 'INTERVIEW_SCHEDULED';
  if (s === 'OFFER' || s === 'OFFERED') return 'OFFER_EXTENDED';
  const valid = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'INTERVIEW_SCHEDULED',
    'OFFER_EXTENDED',
    'HIRED',
    'REJECTED',
    'WITHDRAWN',
  ];
  return valid.includes(s) ? s : 'ALL';
}

function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export default function ApplicantApplicationsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState(() => normalizeStatusParam(searchParams.get('status')));
  const [fromDate, setFromDate] = useState(searchParams.get('fromDate') || '');
  const [toDate, setToDate] = useState(searchParams.get('toDate') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [limit] = useState(10);

  // Synchronize component state whenever URL query params change (e.g. from KPI card click)
  useEffect(() => {
    const rawStatus = searchParams.get('status');
    const targetStatus = normalizeStatusParam(rawStatus);
    if (targetStatus !== statusFilter) {
      setStatusFilter(targetStatus);
      setPage(1);
    }

    const rawSearch = searchParams.get('search') || '';
    if (rawSearch !== searchTerm) {
      setSearchTerm(rawSearch);
      setDebouncedSearch(rawSearch);
    }
  }, [searchParams]);

  // Data & Pagination
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedApp, setSelectedApp] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [withdrawTargetApp, setWithdrawTargetApp] = useState(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch applications with server-side filters
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationsApi.getMyApplications({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sortBy,
        sortOrder,
      });

      if (data && data.applications) {
        setApplications(data.applications);
        if (data.pagination) setPagination(data.pagination);
      } else if (Array.isArray(data)) {
        setApplications(data);
        setPagination({
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
        });
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      toast.error(err.message || 'Unable to retrieve applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [debouncedSearch, statusFilter, fromDate, toDate, sortBy, sortOrder, page]);

  // Deep-linking: auto-open details modal if openId is in URL
  const initialOpenDoneRef = useRef(false);
  useEffect(() => {
    const openId = searchParams.get('openId');
    if (openId && !initialOpenDoneRef.current) {
      initialOpenDoneRef.current = true;
      applicationsApi.getApplicationDetails(openId)
        .then((fullDetails) => {
          setSelectedApp(fullDetails);
        })
        .catch((err) => {
          console.error('Failed to open deep-linked application:', err);
        });
    }
  }, [searchParams]);

  const openDetailsModal = async (app) => {
    try {
      setLoadingDetails(true);
      const fullDetails = await applicationsApi.getApplicationDetails(app.id);
      setSelectedApp(fullDetails);
    } catch (err) {
      console.error('Failed to fetch details:', err);
      toast.error(err.message || 'Failed to open application details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleWithdrawConfirm = async () => {
    if (!withdrawTargetApp) return;

    try {
      setWithdrawing(true);
      await applicationsApi.withdrawApplication(withdrawTargetApp.id, withdrawReason.trim() || undefined);
      toast.info('Your application has been marked as withdrawn.', { title: 'Application Withdrawn' });
      setWithdrawTargetApp(null);
      setWithdrawReason('');
      fetchApplications();
    } catch (err) {
      console.error('Failed to withdraw:', err);
      toast.error(err.message || 'Unable to withdraw application.');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleStatusFilterChange = (key) => {
    setStatusFilter(key);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (key === 'ALL') {
      newParams.delete('status');
    } else {
      newParams.set('status', key);
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('ALL');
    setFromDate('');
    setToDate('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
    setSearchParams({});
  };

  const statusTabs = [
    { key: 'ALL', label: 'All Statuses' },
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
    { key: 'OFFER_EXTENDED', label: 'Offer Extended' },
    { key: 'REJECTED', label: 'Not Selected' },
    { key: 'WITHDRAWN', label: 'Withdrawn' },
  ];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', width: '100%', padding: '0 0.5rem 3rem' }}>
      {/* 1. Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.4rem' }}>
            My Job Applications
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Monitor your submission reference codes, recruitment lifecycle stages, and preserved application documents.
          </p>
        </div>

        <Link
          to="/careers"
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.4rem',
            fontWeight: 600,
            borderRadius: '10px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span>Explore Open Vacancies</span>
          <ArrowRight size={17} />
        </Link>
      </div>

      {/* 2. Search & Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Row 1: Search + Sort */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
            />
            <input
              type="text"
              placeholder="Search by reference # or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.875rem',
                outline: 'none',
                background: '#F8FAFC',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                background: '#FFFFFF',
                color: '#0F172A',
                cursor: 'pointer',
              }}
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="status:asc">Status (A-Z)</option>
            </select>

            {(searchTerm || statusFilter !== 'ALL' || fromDate || toDate) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 0.85rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="Reset all filters"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Status Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.35rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {statusTabs.map((tab) => {
            const isSelected = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleStatusFilterChange(tab.key)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? '#2563EB' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  border: isSelected ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 2px 4px rgba(37, 99, 235, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Row 3: Active Status Filter Indicator Banner with Clear button */}
        {statusFilter !== 'ALL' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.55rem 0.85rem',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
              marginTop: '0.75rem',
              fontSize: '0.825rem',
              color: '#1E40AF',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <SlidersHorizontal size={14} color="#2563EB" />
              <span>
                Filtered by status: <strong>{statusTabs.find(t => t.key === statusFilter)?.label || STATUS_CONFIG[statusFilter]?.label || statusFilter}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleStatusFilterChange('ALL')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: '#DBEAFE',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
              title="Clear status filter"
            >
              <span>Clear Filter</span>
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* 3. Applications Listing Container */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#64748B' }}>
          <Loader2 size={32} className="spin" style={{ margin: '0 auto 1rem', color: '#2563EB' }} />
          <p style={{ fontSize: '0.95rem', margin: 0 }}>Loading your submitted applications...</p>
        </div>
      ) : applications.length === 0 ? (
        /* Empty State */
        <div
          className="card"
          style={{
            padding: '4.5rem 2rem',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#94A3B8',
            }}
          >
            <Briefcase size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'No Matching Applications Found'
              : 'No Job Applications Submitted Yet'}
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try modifying your search keywords or resetting status filters to discover your records.'
              : 'Browse our open engineering, cloud architecture, and AI engineering positions to launch your next career opportunity.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {searchTerm || statusFilter !== 'ALL' ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
              >
                Clear All Filters
              </button>
            ) : (
              <>
                <Link to="/careers" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
                  <span>View Open Roles</span>
                  <ArrowRight size={15} />
                </Link>
                <Link to="/app/documents" className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
                  <span>Manage Resumes Vault</span>
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="desktop-table-view card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', marginBottom: '1.5rem' }}>
            <div className="table-responsive" style={{ margin: 0 }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Reference #</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Role & Department</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Location</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Submitted</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
                    const canWithdraw = app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW';

                    return (
                      <tr key={app.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>
                          {app.referenceNumber}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>{app.job?.title || 'Job Opening'}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{app.job?.department || 'Engineering'}</div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.85rem' }}>
                          {app.job?.location || 'Remote'}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.85rem' }}>
                          {formatDate(app.submittedAt)}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className={`badge ${statusConfig.badgeClass}`} style={{ fontSize: '0.75rem' }}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => openDetailsModal(app)}
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </button>
                            {canWithdraw && (
                              <button
                                type="button"
                                onClick={() => setWithdrawTargetApp(app)}
                                style={{
                                  padding: '0.4rem 0.65rem',
                                  fontSize: '0.8rem',
                                  background: '#FFFFFF',
                                  border: '1px solid #FEE2E2',
                                  color: '#EF4444',
                                  borderRadius: '6px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View (< 768px): Vertical Stack with 0 Horizontal Overflow */}
          <div className="mobile-cards-view" style={{ flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {applications.map((app) => {
              const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
              const canWithdraw = app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW';

              return (
                <div
                  key={`mobile-${app.id}`}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#2563EB',
                          background: '#EFF6FF',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          border: '1px solid #DBEAFE',
                        }}
                      >
                        {app.referenceNumber}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.45rem', marginBottom: '0.2rem' }}>
                        {app.job?.title || 'Job Opening'}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        {app.job?.department} • {app.job?.location}
                      </div>
                    </div>
                    <span className={`badge ${statusConfig.badgeClass}`} style={{ fontSize: '0.72rem', flexShrink: 0 }}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <strong>Submitted:</strong> {formatDate(app.submittedAt)}
                    </div>
                    <div>
                      <strong>Documents:</strong> {app.documents?.length || 1}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => openDetailsModal(app)}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flex: '1 1 auto', justifyContent: 'center' }}
                    >
                      <Eye size={15} />
                      <span>View Details</span>
                    </button>
                    {canWithdraw && (
                      <button
                        type="button"
                        onClick={() => setWithdrawTargetApp(app)}
                        style={{
                          padding: '0.45rem 0.9rem',
                          fontSize: '0.825rem',
                          background: '#FFFFFF',
                          border: '1px solid #FEE2E2',
                          color: '#EF4444',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          flex: '1 1 auto',
                          justifyContent: 'center',
                        }}
                      >
                        <XCircle size={15} />
                        <span>Withdraw</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1rem 0.5rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={pagination.page <= 1}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    opacity: pagination.page <= 1 ? 0.5 : 1,
                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', padding: '0 0.5rem' }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    opacity: pagination.page >= pagination.totalPages ? 0.5 : 1,
                    cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. APPLICATION DETAILS MODAL (WITH FROZEN DOCUMENT SNAPSHOTS)
      ───────────────────────────────────────────────────────────── */}
      {selectedApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(0.5rem, 2.5vw, 1.25rem)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedApp(null);
          }}
        >
          <div
            className="card"
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'clamp(1.25rem, 4vw, 2rem)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#2563EB',
                    background: '#EFF6FF',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #DBEAFE',
                  }}
                >
                  {selectedApp.referenceNumber}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem', marginBottom: '0.2rem' }}>
                  {selectedApp.job?.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  {selectedApp.job?.department} • Submitted on {formatDate(selectedApp.submittedAt)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '0.35rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Preserved Applicant Snapshot */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Preserved Candidate Coordinates
              </h4>
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '1.25rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Full Name</div>
                  <div style={{ fontWeight: 600, color: '#0F172A' }}>{selectedApp.applicantSnapshot?.fullName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Contact Email</div>
                  <div style={{ fontWeight: 600, color: '#0F172A' }}>{selectedApp.applicantSnapshot?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Contact Phone</div>
                  <div style={{ fontWeight: 600, color: '#0F172A' }}>{selectedApp.applicantSnapshot?.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Notice Period</div>
                  <div style={{ fontWeight: 600, color: '#0F172A' }}>{selectedApp.noticePeriod || 'Standard'}</div>
                </div>
              </div>
            </div>

            {/* Frozen Documents Snapshots */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Preserved Submission Documents ({selectedApp.documents?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {selectedApp.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '0.85rem 1rem',
                      background: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={18} color={doc.isResume ? '#2563EB' : '#16A34A'} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F172A', wordBreak: 'break-all' }}>
                          {doc.originalFilename}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {doc.isResume ? 'Primary Resume' : doc.documentType?.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                      Frozen Snapshot
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cover Note if any */}
            {selectedApp.coverNote && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Candidate Note
                </h4>
                <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                  {selectedApp.coverNote}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="btn btn-secondary"
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. WITHDRAW CONFIRMATION MODAL
      ───────────────────────────────────────────────────────────── */}
      {withdrawTargetApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(0.5rem, 2.5vw, 1.25rem)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !withdrawing) setWithdrawTargetApp(null);
          }}
        >
          <div
            className="card"
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'clamp(1.25rem, 4vw, 2rem)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#FEF2F2',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
              Withdraw Application?
            </h3>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Are you sure you want to withdraw your submission for <strong>"{withdrawTargetApp.job?.title}"</strong> (Ref: {withdrawTargetApp.referenceNumber})?
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.35rem' }}>
                Reason for Withdrawal (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Accepted another offer, relocating..."
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  background: '#FFFFFF',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setWithdrawTargetApp(null)}
                disabled={withdrawing}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWithdrawConfirm}
                disabled={withdrawing}
                style={{
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.875rem',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {withdrawing ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Withdrawal</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
