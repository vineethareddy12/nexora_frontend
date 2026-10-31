import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit, Trash2, CheckCircle2, AlertCircle, RefreshCw, X, Play, StopCircle, RotateCcw, Search, Calendar, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { jobsApi } from '../../public/careers/api/jobsApi';
import { useToast } from '../../../components/toast/ToastContext';
import { clientCache } from '../../../core/cache/clientCache';
import { TableSkeleton, RefreshBadge, ErrorState, EmptyState } from '../../../components/common/LoadingStates';

export default function AdminJobsPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);

  const cacheKey = `admin_jobs_${searchTerm.trim()}_${filterStatus}_${filterDept}_${filterAvailability}`;
  const cachedData = clientCache.get(cacheKey);

  const [jobs, setJobs] = useState(() => cachedData || []);
  const [loading, setLoading] = useState(!cachedData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterAvailability, setFilterAvailability] = useState('ALL');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    jobCode: '',
    title: '',
    department: '',
    location: 'Hyderabad, India',
    employmentType: 'FULL_TIME',
    workMode: 'HYBRID',
    experienceRequired: '3+ years',
    salaryRange: '',
    numberOfOpenings: 1,
    applicationDeadline: '',
    description: '',
    responsibilities: '',
    requiredSkills: '',
    requiredQualifications: '',
    status: 'DRAFT',
  });

  const fetchJobs = async (isSilent = false) => {
    try {
      if (!isSilent && jobs.length === 0) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      const params = {
        search: searchTerm.trim() || undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        department: filterDept !== 'ALL' ? filterDept : undefined,
        availability: filterAvailability !== 'ALL' ? filterAvailability : undefined,
      };

      const res = await clientCache.fetchWithDedupe(
        cacheKey,
        () => jobsApi.getAdminJobs(params, token),
        15000
      );

      setJobs(res.items || res.jobs || []);
    } catch (err) {
      console.error('Error fetching admin jobs:', err);
      if (jobs.length === 0) {
        setError(err.message || 'Failed to load jobs.');
      } else {
        toast.error(err.message || 'Failed to update jobs in background.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs(!!cachedData);

    const handleFocus = () => fetchJobs(true);
    const handleAuth = () => fetchJobs(true);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('nexora:admin-authenticated', handleAuth);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('nexora:admin-authenticated', handleAuth);
    };
  }, [searchTerm, filterStatus, filterDept, filterAvailability, token, accessToken, cacheKey]);

  const handleOpenAdd = () => {
    setEditingJob(null);
    const randCode = `NEX-JOB-${Math.floor(100 + Math.random() * 900)}`;
    setFormData({
      jobCode: randCode,
      title: '',
      department: 'Engineering',
      location: 'Hyderabad, India',
      employmentType: 'FULL_TIME',
      workMode: 'HYBRID',
      experienceRequired: '3+ years',
      salaryRange: '',
      numberOfOpenings: 1,
      applicationDeadline: '',
      description: '',
      responsibilities: '',
      requiredSkills: '',
      requiredQualifications: '',
      status: 'DRAFT',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      jobCode: job.jobCode || '',
      title: job.title || '',
      department: job.department || '',
      location: job.location || '',
      employmentType: job.employmentType || 'FULL_TIME',
      workMode: job.workMode || 'HYBRID',
      experienceRequired: job.experienceRequired || '',
      salaryRange: job.salaryRange || '',
      numberOfOpenings: job.numberOfOpenings || 1,
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
      description: job.description || '',
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
      requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : '',
      requiredQualifications: Array.isArray(job.requiredQualifications) ? job.requiredQualifications.join('\n') : '',
      status: job.status || 'DRAFT',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const currentToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);

    try {
      setSaving(true);
      setFormError(null);

      const payload = {
        jobCode: formData.jobCode.trim(),
        title: formData.title.trim(),
        department: formData.department.trim(),
        location: formData.location.trim(),
        employmentType: formData.employmentType,
        workMode: formData.workMode,
        experienceRequired: formData.experienceRequired.trim(),
        salaryRange: formData.salaryRange.trim() || undefined,
        numberOfOpenings: parseInt(formData.numberOfOpenings, 10) || 1,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : undefined,
        description: formData.description.trim(),
        responsibilities: formData.responsibilities
          ? formData.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        requiredSkills: formData.requiredSkills
          ? formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        requiredQualifications: formData.requiredQualifications
          ? formData.requiredQualifications.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        status: formData.status,
      };

      if (editingJob) {
        await jobsApi.updateJob(editingJob.id, payload, currentToken);
        toast.success(`Job vacancy "${payload.title}" updated successfully!`, { title: 'Job Updated' });
      } else {
        await jobsApi.createJob(payload, currentToken);
        toast.success(`New vacancy "${payload.title}" posted successfully!`, { title: 'Job Created' });
      }

      setModalOpen(false);
      clientCache.invalidate('admin_jobs');
      clientCache.invalidate('admin_dashboard');
      fetchJobs(true);
    } catch (err) {
      console.error('Save job failed:', err);
      toast.error(err.message || 'Operation failed.', { title: 'Error' });
      setFormError(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (job, newStatus) => {
    const currentToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);
    try {
      await jobsApi.updateJobStatus(job.id, newStatus, currentToken);
      toast.success(`Job status changed to ${newStatus}.`, { title: 'Status Changed' });
      clientCache.invalidate('admin_jobs');
      clientCache.invalidate('admin_dashboard');
      fetchJobs(true);
    } catch (err) {
      toast.error(err.message || 'Failed to update job status.', { title: 'Update Failed' });
    }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Are you sure you want to delete job vacancy "${job.title}" (${job.jobCode})?`)) {
      return;
    }
    const currentToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);
    try {
      await jobsApi.deleteJob(job.id, currentToken);
      toast.success(`Job vacancy "${job.title}" removed.`, { title: 'Job Deleted' });
      clientCache.invalidate('admin_jobs');
      clientCache.invalidate('admin_dashboard');
      fetchJobs(true);
    } catch (err) {
      toast.error(err.message || 'Failed to delete job.', { title: 'Delete Failed' });
    }
  };

  const departments = Array.from(new Set(jobs.map((j) => j.department).filter(Boolean)));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <Briefcase size={24} color="var(--primary)" />
            <h1 style={{ fontSize: '1.85rem', margin: 0 }}>Job Posting Management</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Create, publish, edit, close, or archive job postings.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <RefreshBadge isRefreshing={isRefreshing} onRefresh={() => fetchJobs(false)} />
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Post New Job Opening</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search jobs by code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value="ALL">All Lifecycle Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value="ALL">All Postings (Active & Expired)</option>
            <option value="ACTIVE">Active (Open to Apply)</option>
            <option value="EXPIRED">Expired (Deadline Passed)</option>
          </select>

          {departments.length > 0 && (
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none' }}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          {(searchTerm || filterStatus !== 'ALL' || filterAvailability !== 'ALL' || filterDept !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('ALL');
                setFilterAvailability('ALL');
                setFilterDept('ALL');
              }}
              className="btn btn-secondary"
              style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading && jobs.length === 0 ? (
          <TableSkeleton rows={5} columns={6} />
        ) : error && jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: '#DC2626',
              }}
            >
              <AlertCircle size={28} />
            </div>
            {error.toLowerCase().includes('token') || error.toLowerCase().includes('unauthorized') ? (
              <>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#0F172A', fontWeight: 700 }}>
                  Administrator Session Expired
                </h3>
                <p style={{ color: '#475569', fontSize: '0.95rem', maxWidth: '460px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                  Your secure administrator session has timed out (sessions expire after 15 minutes of inactivity for security). Please sign in again to continue managing jobs.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href="/login?redirect=/admin/jobs"
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.75rem' }}
                  >
                    <span>Sign In Again</span>
                  </a>
                  <button type="button" onClick={fetchJobs} className="btn btn-secondary">
                    <RefreshCw size={14} />
                    <span>Retry</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#DC2626', fontWeight: 600 }}>
                  Failed to Load Jobs
                </h3>
                <p style={{ color: '#475569', marginBottom: '1.5rem' }}>{error}</p>
                <button type="button" onClick={fetchJobs} className="btn btn-secondary">
                  <RefreshCw size={14} />
                  <span>Retry</span>
                </button>
              </>
            )}
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Briefcase size={36} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Jobs Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Create your first opening or adjust your search filter.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="desktop-table-view table-responsive">
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Code</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Job Title</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Department</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Work Mode</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Deadline</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
                    return (
                      <tr key={job.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: isExpired && job.status === 'PUBLISHED' ? '#FFFBEB' : undefined }}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 600 }}>{job.jobCode}</td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>
                          <div>{job.title}</div>
                          {isExpired && job.status === 'PUBLISHED' && (
                            <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 500 }}>Deadline closed to applicants</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{job.department}</td>
                        <td style={{ padding: '1rem' }}><span className="badge badge-info">{job.workMode}</span></td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                          {job.applicationDeadline ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isExpired ? '#DC2626' : 'var(--text-muted)', fontWeight: isExpired ? 600 : 400 }}>
                              {isExpired && <Clock size={13} color="#DC2626" />}
                              <span>{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                              {isExpired && (
                                <span className="badge badge-danger" style={{ padding: '0.15rem 0.4rem', fontSize: '0.7rem', background: '#FEE2E2', color: '#DC2626', borderColor: '#FCA5A5' }}>
                                  Expired
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>None (Open)</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                            {job.status === 'PUBLISHED' && (
                              isExpired ? (
                                <span className="badge badge-warning" style={{ background: '#FEF3C7', color: '#D97706', borderColor: '#FCD34D' }}>
                                  Published (Expired)
                                </span>
                              ) : (
                                <span className="badge badge-success">Published (Active)</span>
                              )
                            )}
                            {job.status === 'DRAFT' && <span className="badge badge-warning">Draft</span>}
                            {job.status === 'CLOSED' && <span className="badge badge-danger">Closed</span>}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {job.status === 'DRAFT' && (
                            <button
                              className="btn btn-secondary"
                              title="Publish Vacancy"
                              onClick={() => handleStatusChange(job, 'PUBLISHED')}
                              style={{ padding: '0.4rem 0.65rem', marginRight: '0.4rem', color: 'var(--status-success)', fontSize: '0.8rem' }}
                            >
                              <Play size={14} />
                            </button>
                          )}
                          {job.status === 'PUBLISHED' && (
                            <button
                              className="btn btn-secondary"
                              title="Close Vacancy"
                              onClick={() => handleStatusChange(job, 'CLOSED')}
                              style={{ padding: '0.4rem 0.65rem', marginRight: '0.4rem', color: 'var(--status-warning)', fontSize: '0.8rem' }}
                            >
                              <StopCircle size={14} />
                            </button>
                          )}
                          {job.status === 'CLOSED' && (
                            <button
                              className="btn btn-secondary"
                              title="Reopen Vacancy"
                              onClick={() => handleStatusChange(job, 'PUBLISHED')}
                              style={{ padding: '0.4rem 0.65rem', marginRight: '0.4rem', color: 'var(--primary)', fontSize: '0.8rem' }}
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                          <button
                            className="btn btn-secondary"
                            title="Edit Job"
                            onClick={() => handleOpenEdit(job)}
                            style={{ padding: '0.4rem 0.65rem', marginRight: '0.4rem', fontSize: '0.8rem' }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-secondary"
                            title="Delete Job"
                            onClick={() => handleDelete(job)}
                            style={{ padding: '0.4rem 0.65rem', color: 'var(--status-danger)', fontSize: '0.8rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Vertical Cards View (Clean vertical scroll, zero horizontal cutoff) */}
            <div className="mobile-cards-view">
              {jobs.map((job) => {
                const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
                return (
                  <div
                    key={`card-${job.id}`}
                    className="card"
                    style={{
                      padding: '1.15rem',
                      background: '#FFFFFF',
                      border: isExpired && job.status === 'PUBLISHED' ? '1px solid #FCD34D' : '1px solid #E2E8F0',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700 }}>
                          {job.jobCode}
                        </span>
                        <h4 style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                          {job.title}
                        </h4>
                      </div>
                      {job.status === 'PUBLISHED' && (
                        isExpired ? (
                          <span className="badge badge-warning" style={{ background: '#FEF3C7', color: '#D97706', borderColor: '#FCD34D' }}>
                            Published (Expired)
                          </span>
                        ) : (
                          <span className="badge badge-success">Published</span>
                        )
                      )}
                      {job.status === 'DRAFT' && <span className="badge badge-warning">Draft</span>}
                      {job.status === 'CLOSED' && <span className="badge badge-danger">Closed</span>}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: '#64748B' }}>
                      <span className="badge badge-info">{job.workMode}</span>
                      <span>{job.department}</span>
                      <span>•</span>
                      <span style={{ color: isExpired ? '#DC2626' : undefined, fontWeight: isExpired ? 600 : 400 }}>
                        Deadline: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'None'}
                        {isExpired && ' (Expired)'}
                      </span>
                    </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem', paddingTop: '0.65rem', borderTop: '1px solid #F1F5F9' }}>
                    {job.status === 'DRAFT' && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleStatusChange(job, 'PUBLISHED')}
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--status-success)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Play size={14} />
                        <span>Publish</span>
                      </button>
                    )}
                    {job.status === 'PUBLISHED' && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleStatusChange(job, 'CLOSED')}
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--status-warning)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <StopCircle size={14} />
                        <span>Close</span>
                      </button>
                    )}
                    {job.status === 'CLOSED' && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleStatusChange(job, 'PUBLISHED')}
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <RotateCcw size={14} />
                        <span>Reopen</span>
                      </button>
                    )}
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleOpenEdit(job)}
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDelete(job)}
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--status-danger)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </>
        )}
    </div>

    {/* Add / Edit Job Modal */}
    {modalOpen && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(0.5rem, 2.5vw, 1.5rem)' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-secondary)', padding: 'clamp(1.25rem, 4vw, 2rem)', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>
              {editingJob ? 'Edit Vacancy' : 'Post New Job Vacancy'}
            </h2>

            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#fca5a5', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Job Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobCode}
                    onChange={(e) => setFormData({ ...formData, jobCode: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior DevOps Specialist"
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Engineering, Cloud, QA..."
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Employment Type
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="FULL_TIME">Full-Time</option>
                    <option value="PART_TIME">Part-Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Work Mode
                  </label>
                  <select
                    value={formData.workMode}
                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="ON_SITE">On-site</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="REMOTE">Remote</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Experience Req. *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.experienceRequired}
                    onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                    placeholder="e.g. 3+ years"
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Salary Range (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="e.g. ₹15 - ₹22 LPA"
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Full Job Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Responsibilities (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="Design and scale microservices&#10;Implement CI/CD pipelines"
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Required Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="Node.js, React, Docker, Kubernetes, PostgreSQL"
                  style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ minWidth: '130px' }}>
                  {saving ? 'Saving...' : editingJob ? 'Update Vacancy' : 'Save Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
