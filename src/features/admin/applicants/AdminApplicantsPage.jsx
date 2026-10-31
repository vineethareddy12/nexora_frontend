import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  SlidersHorizontal,
  Eye, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Calendar, 
  Phone, 
  Mail, 
  Briefcase, 
  Award, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { adminReviewApi } from '../review/adminReviewApi';
import { useToast } from '../../../components/toast/ToastContext';
import { clientCache } from '../../../core/cache/clientCache';
import { TableSkeleton, RefreshBadge, ErrorState, EmptyState } from '../../../components/common/LoadingStates';

export default function AdminApplicantsPage() {
  const { accessToken } = useAuth();
  const toast = useToast();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const cacheKey = `admin_applicants_${page}_${debouncedSearch}_${profileFilter}_${statusFilter}`;
  const cachedData = clientCache.get(cacheKey);

  const [applicants, setApplicants] = useState(() => cachedData?.applicants || []);
  const [pagination, setPagination] = useState(() => cachedData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(!cachedData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Selected Applicant for Details Modal
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const activeFiltersCount = (searchTerm ? 1 : 0) + (profileFilter !== 'ALL' ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadApplicants = async (isSilent = false) => {
    try {
      if (!isSilent && applicants.length === 0) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setFetchError(null);

      const data = await clientCache.fetchWithDedupe(
        cacheKey,
        () => adminReviewApi.getApplicants({
          page,
          limit: 10,
          search: debouncedSearch,
          hasProfile: profileFilter,
          status: statusFilter,
        }),
        15000
      );

      if (data) {
        setApplicants(data.applicants || []);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
      if (applicants.length === 0) {
        setFetchError(err.message || 'Unable to retrieve applicants.');
      } else {
        toast.error(err.message || 'Failed to refresh applicants in background.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadApplicants(!!cachedData);

    const handleFocus = () => loadApplicants(true);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadApplicants(true);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [debouncedSearch, profileFilter, statusFilter, page, cacheKey]);

  const openApplicantDetails = async (id) => {
    try {
      setLoadingDetails(true);
      const details = await adminReviewApi.getApplicantDetails(id);
      setSelectedApplicant(details);
    } catch (err) {
      console.error('Failed to open applicant details:', err);
      toast.error(err.message || 'Failed to load applicant details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setProfileFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#0F172A', margin: 0, marginBottom: '0.35rem' }}>
            Registered Applicant Directory
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
            Manage registered candidates, inspect profile credentials, and view submission metrics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <RefreshBadge isRefreshing={isRefreshing} onRefresh={() => loadApplicants(false)} />

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

      {/* 2. Split Layout: Left Filter Panel + Right Content */}
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
              <span>Filter Applicants</span>
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
            {/* 1. Search */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                Search Candidates
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* 2. Profile Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                Profile Status
              </label>
              <select
                value={profileFilter}
                onChange={(e) => {
                  setProfileFilter(e.target.value);
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
                <option value="ALL">All Profiles</option>
                <option value="YES">Complete Profiles</option>
                <option value="NO">Incomplete Profiles</option>
              </select>
            </div>

            {/* 3. Account Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
                Account Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
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
                <option value="ALL">All Accounts</option>
                <option value="ACTIVE">Active Accounts</option>
                <option value="DISABLED">Disabled Accounts</option>
              </select>
            </div>

            {/* 4. Reset Filters Button */}
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
          {fetchError && applicants.length === 0 ? (
            <ErrorState
              title="Unable to load applicants directory"
              message={fetchError}
              onRetry={() => loadApplicants(false)}
            />
          ) : loading && applicants.length === 0 ? (
            <TableSkeleton rows={5} columns={6} />
          ) : applicants.length === 0 ? (
            <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
              <Users size={40} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>No Applicants Found</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                {activeFiltersCount > 0
                  ? 'Try modifying your search query or resetting filters.'
                  : 'Registered candidates will appear here as they sign up for Nexora.'}
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
            <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Applicant Name</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Phone & Location</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Qualification</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Registered On</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Applications</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.25rem', maxWidth: '240px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.fullName}>{a.fullName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.email}>{a.email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.85rem' }}>
                      <div>{a.phone || '—'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{a.currentLocation || 'No location'}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#475569', fontSize: '0.85rem' }}>
                      {a.highestQualification ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{a.highestQualification}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{a.totalExperienceYears} yrs experience</div>
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Incomplete</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: '#64748B', fontSize: '0.85rem' }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        {a.applicationsCount} submitted
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => openApplicantDetails(a.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Eye size={14} />
                        <span>View Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-cards-view" style={{ flexDirection: 'column', gap: '0.85rem', padding: '1rem' }}>
            {applicants.map((a) => (
              <div
                key={`m-app-${a.id}`}
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
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                      {a.fullName}
                    </h4>
                    <div style={{ fontSize: '0.825rem', color: '#64748B', wordBreak: 'break-all' }}>{a.email}</div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.72rem', flexShrink: 0 }}>
                    {a.applicationsCount} Apps
                  </span>
                </div>

                <div style={{ fontSize: '0.825rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {a.phone && <div><strong>Phone:</strong> {a.phone}</div>}
                  {a.highestQualification && <div><strong>Qualification:</strong> {a.highestQualification}</div>}
                  <div><strong>Registered:</strong> {new Date(a.createdAt).toLocaleDateString()}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.6rem', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    type="button"
                    onClick={() => openApplicantDetails(a.id)}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Eye size={14} />
                    <span>View Profile</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1.25rem',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
                Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} applicants)
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

      {/* 4. Applicant Details Modal */}
      {selectedApplicant && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
          onClick={() => setSelectedApplicant(null)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                  {selectedApplicant.fullName}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>{selectedApplicant.email}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.35rem', cursor: 'pointer', color: '#475569' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Credentials */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                Profile Coordinates & Qualifications
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Phone</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApplicant.profile?.phone || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Location</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApplicant.profile?.currentLocation || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Qualification</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApplicant.profile?.highestQualification || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>University</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApplicant.profile?.collegeUniversity || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Experience</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{selectedApplicant.profile?.totalExperienceYears ? `${selectedApplicant.profile.totalExperienceYears} Years` : '0 Years'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase' }}>Registered Date</div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>{new Date(selectedApplicant.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Submitted Applications History */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                Submitted Applications ({selectedApplicant.applications?.length || 0})
              </h4>
              {!selectedApplicant.applications || selectedApplicant.applications.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>No applications submitted yet by this candidate.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedApplicant.applications.map((app) => (
                    <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#2563EB' }}>{app.referenceNumber}</div>
                        <div style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 600 }}>{app.job.title}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</div>
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{app.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
              <button type="button" onClick={() => setSelectedApplicant(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
