import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Clock, ChevronRight, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { jobsApi } from './api/jobsApi';

export default function CareersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchTerm.trim() || undefined,
        employmentType: selectedType !== 'ALL' ? selectedType : undefined,
        workMode: selectedMode !== 'ALL' ? selectedMode : undefined,
        department: selectedDept !== 'ALL' ? selectedDept : undefined,
      };
      const res = await jobsApi.getPublishedJobs(params);
      setJobs(res.items || res.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Unable to load open vacancies at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, selectedMode, selectedDept]);

  // Extract unique departments for filter dropdown
  const departments = Array.from(new Set(jobs.map((j) => j.department).filter(Boolean)));

  const formatEmploymentType = (type) => {
    switch (type) {
      case 'FULL_TIME': return 'Full-time';
      case 'PART_TIME': return 'Part-time';
      case 'CONTRACT': return 'Contract';
      case 'INTERNSHIP': return 'Internship';
      default: return type || 'Full-time';
    }
  };

  const formatWorkMode = (mode) => {
    switch (mode) {
      case 'ON_SITE': return 'On-site';
      case 'HYBRID': return 'Hybrid';
      case 'REMOTE': return 'Remote';
      default: return mode || 'On-site';
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>Open Roles</span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Build Your Career at Nexora</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto', fontSize: '1.05rem' }}>
          Explore career-defining opportunities across engineering, architecture, and technology leadership.
        </p>
      </div>

      {/* Search and Filters Shell */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by job title or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Employment Types</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>

          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Work Modes</option>
            <option value="ON_SITE">On-site</option>
            <option value="HYBRID">Hybrid</option>
            <option value="REMOTE">Remote</option>
          </select>

          {departments.length > 0 && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading open vacancies from Nexora database...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderColor: 'var(--status-danger)' }}>
          <AlertCircle size={36} color="var(--status-danger)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Failed to Load Vacancies</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={fetchJobs} className="btn btn-secondary">
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && jobs.length === 0 && (
        <div className="glass-panel" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <Briefcase size={44} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Vacancies Found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            We could not find any active vacancies matching your search criteria. Try adjusting your filters or check back soon.
          </p>
          {(searchTerm || selectedType !== 'ALL' || selectedMode !== 'ALL' || selectedDept !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('ALL');
                setSelectedMode('ALL');
                setSelectedDept('ALL');
              }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Live Job Cards */}
      {!loading && !error && jobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {jobs.map((job) => (
            <div key={job.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ flex: '1 1 500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-info">{job.department}</span>
                  <span className="badge badge-primary">{formatWorkMode(job.workMode)}</span>
                  <span className="badge badge-secondary">{job.jobCode}</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>{job.title}</h3>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} />
                    <span>{job.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Briefcase size={15} />
                    <span>{formatEmploymentType(job.employmentType)}</span>
                  </div>
                  {job.experienceRequired && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={15} />
                      <span>{job.experienceRequired}</span>
                    </div>
                  )}
                  {job.applicationDeadline && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={15} />
                      <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '750px', lineHeight: 1.6 }}>
                  {job.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to={`/jobs/${job.id}`} className="btn btn-secondary">
                  <span>View Details</span>
                </Link>
                <Link to={`/jobs/${job.id}`} className="btn btn-primary">
                  <span>Apply Now</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
