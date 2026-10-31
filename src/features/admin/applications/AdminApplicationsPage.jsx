import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  FileCheck2, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  ExternalLink, 
  RotateCcw, 
  SlidersHorizontal, 
  X, 
  CheckCircle2, 
  Clock, 
  Award, 
  XCircle, 
  CalendarClock, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  MessageSquare, 
  History, 
  ShieldAlert, 
  Send,
  FileText
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { adminReviewApi } from '../review/adminReviewApi';
import { useToast } from '../../../components/toast/ToastContext';
import { clientCache } from '../../../core/cache/clientCache';
import { TableSkeleton, RefreshBadge, ErrorState, EmptyState } from '../../../components/common/LoadingStates';
import { jobsApi } from '../../public/careers/api/jobsApi';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', badgeClass: 'badge-primary', color: '#2563EB' },
  UNDER_REVIEW: { label: 'Under Review', badgeClass: 'badge-warning', color: '#D97706' },
  SHORTLISTED: { label: 'Shortlisted', badgeClass: 'badge-info', color: '#0D9488' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', badgeClass: 'badge-primary', color: '#7C3AED' },
  SELECTED: { label: 'Selected', badgeClass: 'badge-success', color: '#059669' },
  REJECTED: { label: 'Rejected', badgeClass: 'badge-danger', color: '#DC2626' },
  OFFER_EXTENDED: { label: 'Selected', badgeClass: 'badge-success', color: '#059669' },
  HIRED: { label: 'Hired', badgeClass: 'badge-success', color: '#059669' },
  WITHDRAWN: { label: 'Withdrawn', badgeClass: 'badge-neutral', color: '#64748B' },
};

const PERMITTED_TRANSITIONS = {
  SUBMITTED: ['UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  UNDER_REVIEW: ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW_SCHEDULED', 'SELECTED', 'UNDER_REVIEW', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_SCHEDULED: ['SELECTED', 'REJECTED', 'SHORTLISTED', 'WITHDRAWN'],
  SELECTED: ['HIRED', 'REJECTED', 'WITHDRAWN', 'UNDER_REVIEW'],
  OFFER_EXTENDED: ['SELECTED', 'HIRED', 'REJECTED', 'WITHDRAWN'],
  REJECTED: ['UNDER_REVIEW', 'SHORTLISTED'],
  WITHDRAWN: [],
  HIRED: [],
};

function normalizeStatus(status) {
  if (!status) return 'ALL';
  const s = status.trim().toUpperCase();
  if (s === 'ALL') return 'ALL';
  if (s === 'INTERVIEW') return 'INTERVIEW_SCHEDULED';
  if (s === 'OFFER' || s === 'OFFERED' || s === 'OFFER_EXTENDED' || s === 'SELECTED') return 'SELECTED';
  const valid = [
    'SUBMITTED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'INTERVIEW_SCHEDULED',
    'SELECTED',
    'REJECTED',
    'WITHDRAWN',
  ];
  return valid.includes(s) ? s : 'ALL';
}

export default function AdminApplicationsPage() {
  const { accessToken, user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState(() => normalizeStatus(searchParams.get('status')));
  const [jobFilter, setJobFilter] = useState(searchParams.get('jobId') || 'ALL');
  const [fromDate, setFromDate] = useState(searchParams.get('fromDate') || '');
  const [toDate, setToDate] = useState(searchParams.get('toDate') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'submittedAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const cacheKey = `admin_applications_${page}_${debouncedSearch}_${statusFilter}_${jobFilter}_${fromDate}_${toDate}_${sortBy}_${sortOrder}`;
  const cachedData = clientCache.get(cacheKey);

  // Data
  const [applications, setApplications] = useState(() => cachedData?.applications || []);
  const [jobsList, setJobsList] = useState([]);
  const [pagination, setPagination] = useState(() => cachedData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(!cachedData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Review Drawer / Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Status Update State
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [internalRemarks, setInternalRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  // Internal Notes State
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Synchronize with searchParams changes (e.g. from KPI card click)
  useEffect(() => {
    const s = normalizeStatus(searchParams.get('status'));
    if (s !== statusFilter) {
      setStatusFilter(s);
      setPage(1);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load jobs for filter dropdown
  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await jobsApi.getAdminJobs({ limit: 100 }, accessToken).catch(() => null);
        if (res?.jobs) {
          setJobsList(res.jobs);
        } else {
          const pub = await jobsApi.getPublishedJobs({ limit: 100 }).catch(() => null);
          if (pub?.jobs) setJobsList(pub.jobs);
        }
      } catch (e) {
        // Fallback gracefully
      }
    }
    fetchJobs();
  }, [accessToken]);

  const loadApplications = async (isSilent = false) => {
    try {
      if (!isSilent && applications.length === 0) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setFetchError(null);

      const data = await clientCache.fetchWithDedupe(
        cacheKey,
        () => adminReviewApi.getApplications({
          page,
          limit: 10,
          search: debouncedSearch,
          status: statusFilter,
          jobId: jobFilter !== 'ALL' ? jobFilter : undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          sortBy,
          sortOrder,
        }),
        15000
      );

      if (data) {
        setApplications(data.applications || []);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      if (applications.length === 0) {
        setFetchError(err.message || 'Unable to retrieve applications.');
      } else {
        toast.error(err.message || 'Failed to refresh applications in background.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadApplications(!!cachedData);

    const handleFocus = () => loadApplications(true);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadApplications(true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [debouncedSearch, statusFilter, jobFilter, fromDate, toDate, sortBy, sortOrder, page, cacheKey]);

  // Deep-linking: auto-open details modal if openId is in URL
  const initialOpenRef = useRef(false);
  useEffect(() => {
    const openId = searchParams.get('openId');
    if (openId && !initialOpenRef.current) {
      initialOpenRef.current = true;
      openReviewModal(openId);
    }
  }, [searchParams]);

  const openReviewModal = async (id) => {
    try {
      setLoadingDetails(true);
      const details = await adminReviewApi.getApplicationDetails(id);
      setSelectedApp(details);
      setNewStatus('');
      setStatusRemarks('');
      setInternalRemarks('');
      setShowStatusConfirm(false);
    } catch (err) {
      console.error('Failed to open application review:', err);
      toast.error(err.message || 'Failed to load application review details.');
    } finally {
      setLoadingDetails(false);
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
    setJobFilter('ALL');
    setFromDate('');
    setToDate('');
    setSortBy('submittedAt');
    setSortOrder('desc');
    setPage(1);
    setSearchParams({});
  };

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0) +
    (jobFilter !== 'ALL' ? 1 : 0) +
    (fromDate || toDate ? 1 : 0);

  const handleExecuteStatusUpdate = async () => {
    if (!selectedApp || !newStatus) return;

    try {
      setUpdatingStatus(true);
      await adminReviewApi.updateStatus(selectedApp.id, {
        status: newStatus,
        remarks: statusRemarks.trim() || undefined,
        internalRemarks: internalRemarks.trim() || undefined,
      });

      toast.success(`Application status transitioned to ${newStatus}.`, { title: 'Status Updated' });
      setShowStatusConfirm(false);
      setNewStatus('');
      setStatusRemarks('');
      setInternalRemarks('');

      // Refresh application details and listing
      const refreshed = await adminReviewApi.getApplicationDetails(selectedApp.id);
      setSelectedApp(refreshed);
      clientCache.invalidate('admin_applications');
      clientCache.invalidate('admin_dashboard');
      loadApplications(true);
    } catch (err) {
      console.error('Status update failed:', err);
      toast.error(err.message || 'Failed to update application status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddReviewNote = async (e) => {
    e.preventDefault();
    if (!selectedApp || !newNote.trim()) return;

    try {
      setSubmittingNote(true);
      await adminReviewApi.addNote(selectedApp.id, { note: newNote });
      toast.success('Internal review note recorded.', { title: 'Note Added' });
      setNewNote('');

      // Refresh review notes
      const refreshed = await adminReviewApi.getApplicationDetails(selectedApp.id);
      setSelectedApp(refreshed);
    } catch (err) {
      console.error('Failed to add note:', err);
      toast.error(err.message || 'Failed to add review note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const permittedNext = selectedApp ? PERMITTED_TRANSITIONS[selectedApp.status] || [] : [];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
            Job Applications & Candidate Evaluation
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Review applicant qualifications, advance stage transitions, and maintain internal review notes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <RefreshBadge isRefreshing={isRefreshing} onRefresh={() => loadApplications(false)} />

          {/* Mobile Filters Toggle Button */}
          <div className="show-mobile-only" style={{ display: 'none' }}>
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem' }}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="badge badge-primary" style={{ padding: '0.1rem 0.45rem', fontSize: '0.72rem' }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
          </div>
        </div>
      </div>

      {/* 2. Split Layout: Dedicated Left Filter Panel + Right Content */}
      <div className="admin-page-split-layout">
        {/* Mobile Filter Drawer Backdrop */}
        {filterDrawerOpen && (
          <div className="filter-drawer-backdrop" onClick={() => setFilterDrawerOpen(false)} />
        )}

        {/* Dedicated Left-Side Filter Panel */}
        <aside className={`admin-filter-sidebar ${filterDrawerOpen ? 'filter-drawer-open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
              <Filter size={16} color="#2563EB" />
              <span>Filter Applications</span>
            </div>
            {filterDrawerOpen && (
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#64748B' }}
                aria-label="Close Filters"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* 1. Search Box */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                Search
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Ref #, candidate, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.15rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#FFFFFF',
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Status Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            {/* 3. Job Posting Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                Job Posting
              </label>
              <select
                value={jobFilter}
                onChange={(e) => {
                  setJobFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Job Postings</option>
                {jobsList.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} {j.jobCode ? `(${j.jobCode})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Sort Order */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                Sort By
              </label>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split(':');
                  setSortBy(sb);
                  setSortOrder(so);
                  setPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                <option value="submittedAt:desc">Newest Submissions</option>
                <option value="submittedAt:asc">Oldest Submissions</option>
                <option value="updatedAt:desc">Recently Updated</option>
                <option value="status:asc">Status (A-Z)</option>
              </select>
            </div>

            {/* 5. Date Range */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                Submission Date Range
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                  title="From Date"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.825rem',
                    background: '#FFFFFF',
                    color: '#0F172A',
                  }}
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                  title="To Date"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.825rem',
                    background: '#FFFFFF',
                    color: '#0F172A',
                  }}
                />
              </div>
            </div>

            {/* 6. Reset Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', justifyContent: 'center', marginTop: '0.25rem' }}
              >
                <RotateCcw size={14} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <div className="admin-page-main-content">
          {/* Active status indicator if filtered */}
          {statusFilter !== 'ALL' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.85rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.825rem', color: '#1E40AF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <SlidersHorizontal size={14} color="#2563EB" />
                <span>
                  Filtered by status: <strong>{STATUS_CONFIG[statusFilter]?.label || statusFilter}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleStatusFilterChange('ALL')}
                style={{ background: '#DBEAFE', border: '1px solid #BFDBFE', color: '#1E40AF', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', padding: '0.2rem 0.55rem', borderRadius: '6px' }}
              >
                Clear Filter
              </button>
            </div>
          )}

          {fetchError && applications.length === 0 ? (
            <ErrorState
              title="Unable to load applications"
              message={fetchError}
              onRetry={() => loadApplications(false)}
            />
          ) : loading && applications.length === 0 ? (
            <TableSkeleton rows={5} columns={6} />
          ) : applications.length === 0 ? (
            <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
              <FileCheck2 size={40} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No Applications Found</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                {activeFiltersCount > 0 ? 'Try adjusting your search criteria or resetting filters.' : 'No candidates have applied to open positions yet.'}
              </p>
              {activeFiltersCount > 0 && (
                <button type="button" onClick={handleResetFilters} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', marginBottom: '1.5rem' }}>
              {/* Desktop Table View */}
              <div className="desktop-table-view table-responsive" style={{ margin: 0 }}>
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Reference #</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Applicant</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Position & Department</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Submitted</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const badge = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>
                        {app.referenceNumber}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', maxWidth: '240px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.applicant.fullName}>
                          {app.applicant.fullName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.applicant.email}>
                          {app.applicant.email}
                        </div>
                        {app.applicant.phone && <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{app.applicant.phone}</div>}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{app.job.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{app.job.department} • {app.job.location}</div>
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
                        <button
                          type="button"
                          onClick={() => openReviewModal(app.id)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Eye size={14} />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Vertical Cards View */}
          <div className="mobile-cards-view" style={{ flexDirection: 'column', gap: '0.85rem', padding: '1rem' }}>
            {applications.map((app) => {
              const badge = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
              return (
                <div
                  key={`m-app-${app.id}`}
                  className="card"
                  style={{
                    padding: '1.15rem',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                        {app.referenceNumber}
                      </span>
                      <h4 style={{ margin: '0.2rem 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                        {app.applicant.fullName}
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600 }}>{app.job.title}</div>
                    </div>
                    <span className={`badge ${badge.badgeClass}`} style={{ fontSize: '0.7rem', flexShrink: 0 }}>
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    <div style={{ wordBreak: 'break-all' }}>{app.applicant.email}</div>
                    <div>Applied: {new Date(app.submittedAt).toLocaleDateString()}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.6rem', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={() => openReviewModal(app.id)}
                      className="btn btn-secondary"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <Eye size={14} />
                      <span>Review Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
                Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} applications)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        </div>
      </div>

      {/* 4. Comprehensive Application Review Modal (Sections A - F) */}
      {selectedApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '880px',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#2563EB', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  <span>{selectedApp.referenceNumber}</span>
                </div>
                <h2 style={{ margin: '0.2rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
                  {selectedApp.job.title}
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Candidate: <strong>{selectedApp.applicant.fullName}</strong> ({selectedApp.applicant.email})
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`badge ${STATUS_CONFIG[selectedApp.status]?.badgeClass}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                  {STATUS_CONFIG[selectedApp.status]?.label || selectedApp.status}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#475569' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Section A: Application Info */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem' }}>
                A. Application Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Submitted On</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{new Date(selectedApp.submittedAt).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Last Updated</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{new Date(selectedApp.updatedAt).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Notice Period</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApp.noticePeriod || 'Immediate'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Privacy Agreed</div>
                  <div style={{ fontWeight: 600, color: '#059669', fontSize: '0.875rem' }}>Acknowledged (v{selectedApp.privacyNoticeVersion})</div>
                </div>
              </div>
            </div>

            {/* Section B: Applicant Submitted Snapshot & Profile */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem' }}>
                B. Applicant Information (Submitted Snapshot)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Full Name</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApp.applicantSnapshot?.fullName || selectedApp.applicant.fullName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Email</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApp.applicantSnapshot?.email || selectedApp.applicant.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Phone</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApp.applicantSnapshot?.phone || selectedApp.applicant.profile?.phone || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Location</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApp.applicantSnapshot?.currentLocation || selectedApp.applicant.profile?.currentLocation || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Highest Qualification</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApp.applicantSnapshot?.highestQualification || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Experience</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApp.applicantSnapshot?.totalExperienceYears ? `${selectedApp.applicantSnapshot.totalExperienceYears} Years` : '0 Years'}</div>
                </div>
              </div>
            </div>

            {/* Section C: Submitted Resume & Certificates (Secure Access) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem' }}>
                C. Submitted Documents & Credentials
              </h4>
              {!selectedApp.documents || selectedApp.documents.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>No documents attached to this application snapshot.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedApp.documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <FileText size={18} color="#2563EB" />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{doc.originalFilename}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {doc.isResume ? 'Primary Resume' : 'Supporting Certificate'} • {(doc.fileSizeBytes / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <a
                          href={adminReviewApi.getDocumentDownloadUrl(selectedApp.id, doc.id, true)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await adminReviewApi.downloadOrPreviewDocument(selectedApp.id, doc.id, true, doc.originalFilename);
                            } catch (err) {
                              toast.error(err.message || 'Unable to preview document');
                            }
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <ExternalLink size={13} />
                          <span>Preview</span>
                        </a>
                        <a
                          href={adminReviewApi.getDocumentDownloadUrl(selectedApp.id, doc.id, false)}
                          download
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await adminReviewApi.downloadOrPreviewDocument(selectedApp.id, doc.id, false, doc.originalFilename);
                            } catch (err) {
                              toast.error(err.message || 'Unable to download document');
                            }
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Download size={13} />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section D: Application Answers / Cover Note */}
            {selectedApp.coverNote && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.65rem' }}>
                  D. Candidate Cover Note
                </h4>
                <div style={{ padding: '0.85rem 1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.875rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {selectedApp.coverNote}
                </div>
              </div>
            )}

            {/* Section E: Application Status Management & Permitted Transitions */}
            <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    E. Status Lifecycle Management
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Current status: <strong>{selectedApp.status}</strong>
                  </div>
                </div>
              </div>

              {permittedNext.length === 0 ? (
                <div style={{ padding: '0.65rem', background: '#FEF3C7', color: '#92400E', borderRadius: '8px', fontSize: '0.825rem' }}>
                  No further status transitions permitted. This application is in a terminal state ({selectedApp.status}).
                </div>
              ) : (
                <div>
                  {!showStatusConfirm ? (
                    <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        style={{
                          padding: '0.55rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.85rem',
                          background: '#FFFFFF',
                          color: '#0F172A',
                          cursor: 'pointer',
                          minWidth: '200px',
                        }}
                      >
                        <option value="">Select next status transition...</option>
                        {permittedNext.map((st) => (
                          <option key={st} value={st}>
                            Advance to {STATUS_CONFIG[st]?.label || st}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={!newStatus}
                        onClick={() => setShowStatusConfirm(true)}
                        className="btn btn-primary"
                        style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                      >
                        Update Status
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E40AF', marginBottom: '0.5rem' }}>
                        Confirm Status Transition: {selectedApp.status} → {newStatus}
                      </div>

                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', marginBottom: '0.3rem' }}>
                          Candidate-Visible Remarks (optional):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Profile shortlisted for technical evaluation round."
                          value={statusRemarks}
                          onChange={(e) => setStatusRemarks(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div style={{ marginBottom: '0.85rem' }}>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#64748B', marginBottom: '0.3rem' }}>
                          Internal Admin Audit Notes (private to admins):
                        </label>
                        <input
                          type="text"
                          placeholder="Internal decision context or reason for transition..."
                          value={internalRemarks}
                          onChange={(e) => setInternalRemarks(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          disabled={updatingStatus}
                          onClick={handleExecuteStatusUpdate}
                          className="btn btn-primary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}
                        >
                          {updatingStatus ? 'Saving Transition...' : 'Confirm & Save Transition'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowStatusConfirm(false)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 0.85rem', fontSize: '0.825rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section F: Status Transition Audit History */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                <History size={16} color="#64748B" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  F. Status Transition Audit Trail
                </h4>
              </div>

              {!selectedApp.statusHistory || selectedApp.statusHistory.length === 0 ? (
                <p style={{ fontSize: '0.825rem', color: '#64748B', margin: 0 }}>No status changes recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedApp.statusHistory.map((hist) => (
                    <div key={hist.id} style={{ padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.825rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <div>
                          <strong>{hist.previousStatus}</strong> → <strong>{hist.newStatus}</strong>
                        </div>
                        <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                          {new Date(hist.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ color: '#64748B' }}>
                        Changed by: {hist.changedBy?.fullName || 'Administrator'}
                      </div>
                      {hist.applicantVisibleRemarks && (
                        <div style={{ marginTop: '0.25rem', color: '#2563EB' }}>
                          Public Remarks: "{hist.applicantVisibleRemarks}"
                        </div>
                      )}
                      {hist.internalRemarks && (
                        <div style={{ marginTop: '0.25rem', color: '#7C3AED', fontStyle: 'italic' }}>
                          Internal: "{hist.internalRemarks}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section G: Internal Administrative Review Notes */}
            <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                <MessageSquare size={16} color="#2563EB" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  G. Internal Recruitment Review Notes (Private to Admins)
                </h4>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 0.85rem' }}>
                Notes added here are permanently logged and strictly confidential. Applicants cannot see these notes.
              </p>

              {/* Add Note Form */}
              <form onSubmit={handleAddReviewNote} style={{ marginBottom: '1rem' }}>
                <textarea
                  rows={3}
                  placeholder="Record an evaluation comment, interview feedback, or review note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical', outline: 'none', background: '#FFFFFF' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={submittingNote || !newNote.trim()}
                    className="btn btn-primary"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Send size={13} />
                    <span>{submittingNote ? 'Saving...' : 'Add Internal Note'}</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              {!selectedApp.reviewNotes || selectedApp.reviewNotes.length === 0 ? (
                <div style={{ color: '#94A3B8', fontSize: '0.825rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                  No internal notes recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedApp.reviewNotes.map((n) => (
                    <div key={n.id} style={{ background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.825rem', color: '#0F172A' }}>
                          {n.admin?.fullName || 'Administrator'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {n.note}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.25rem' }}
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
