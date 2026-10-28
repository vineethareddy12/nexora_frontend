import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Edit, Trash2, CheckCircle2, AlertCircle, RefreshCw, X, Play, StopCircle, RotateCcw, Search, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { jobsApi } from '../../public/careers/api/jobsApi';
import { useToast } from '../../../components/toast/ToastContext';

export default function AdminJobsPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');

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

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchTerm.trim() || undefined,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        department: filterDept !== 'ALL' ? filterDept : undefined,
      };
      const res = await jobsApi.getAdminJobs(params, token);
      setJobs(res.items || res.jobs || []);
    } catch (err) {
      console.error('Error fetching admin jobs:', err);
      setError(err.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);

    const handleAuth = () => fetchJobs();
    window.addEventListener('nexora:admin-authenticated', handleAuth);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('nexora:admin-authenticated', handleAuth);
    };
  }, [searchTerm, filterStatus, filterDept, token, accessToken]);

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
      fetchJobs();
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
      fetchJobs();
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
      fetchJobs();
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
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Post New Job Opening</span>
        </button>
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
            <option value="PUBLISHED">Published (Active)</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
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
        </div>
      </div>

      {/* Jobs Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw className="animate-spin" size={28} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading job vacancies...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--status-danger)' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 1rem' }} />
            <p>{error}</p>
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
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
              {jobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 600 }}>{job.jobCode}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{job.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{job.department}</td>
                  <td style={{ padding: '1rem' }}><span className="badge badge-info">{job.workMode}</span></td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'None'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {job.status === 'PUBLISHED' && <span className="badge badge-success">Published</span>}
                    {job.status === 'DRAFT' && <span className="badge badge-warning">Draft</span>}
                    {job.status === 'CLOSED' && <span className="badge badge-danger">Closed</span>}
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
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Job Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
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
