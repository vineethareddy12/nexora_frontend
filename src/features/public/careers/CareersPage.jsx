import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Clock, ChevronRight, ChevronLeft, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { jobsApi } from './api/jobsApi';

export default function CareersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedMode, setSelectedMode] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false });

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
        availability: selectedAvailability !== 'ALL' ? selectedAvailability : undefined,
        page: currentPage,
        limit: 10,
      };
      const res = await jobsApi.getPublishedJobs(params);
      setJobs(res.items || res.jobs || []);
      if (res.pagination) {
        setPagination(res.pagination);
      } else if (res.totalPages) {
        setPagination({
          page: res.page || currentPage,
          limit: res.limit || 10,
          totalItems: res.totalCount || res.totalItems || (res.items?.length || 0),
          totalPages: res.totalPages,
          hasNextPage: res.hasNextPage || (currentPage < res.totalPages),
          hasPrevPage: res.hasPrevPage || (currentPage > 1),
        });
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Unable to load open vacancies at this time.');
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedMode, selectedDept, selectedAvailability]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, selectedMode, selectedDept, selectedAvailability, currentPage]);

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
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(3rem, 5vw, 5rem) clamp(1rem, 3vw, 1.5rem)', background: '#FFFFFF' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.85rem' }}>
          Open Roles
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
            marginBottom: '1rem',
            color: '#0F172A',
            fontWeight: 800,
          }}
        >
          Build Your Career at Nexora
        </h1>
        <p style={{ color: '#475569', maxWidth: '640px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.7 }}>
          Explore career-defining opportunities across software engineering, cloud architecture, and technology
          leadership.
        </p>
      </div>

      {/* Search and Filters Shell */}
      <div
        className="card"
        style={{
          padding: 'clamp(1rem, 3vw, 1.75rem)',
          marginBottom: '2.5rem',
          background: '#F8FAFC',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
              }}
            />
            <input
              type="text"
              placeholder="Search by job title or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: '10px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              fontSize: '0.9rem',
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
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Work Modes</option>
            <option value="ON_SITE">On-site</option>
            <option value="HYBRID">Hybrid</option>
            <option value="REMOTE">Remote</option>
          </select>

          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Vacancies</option>
            <option value="ACTIVE">Active (Open to Apply)</option>
            <option value="EXPIRED">Expired (Deadline Passed)</option>
          </select>

          {departments.length > 0 && (
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <RefreshCw className="spin" size={32} color="#2563EB" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748B' }}>Loading open vacancies from Nexora database...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          className="card"
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            borderColor: '#FECACA',
            background: '#FEF2F2',
            maxWidth: '540px',
            margin: '0 auto 2.5rem',
          }}
        >
          <AlertCircle size={36} color="#DC2626" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#DC2626' }}>
            Failed to Load Vacancies
          </h3>
          <p style={{ color: '#475569', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={fetchJobs} className="btn btn-secondary">
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && jobs.length === 0 && (
        <div
          className="card"
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
          }}
        >
          <Briefcase size={44} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#0F172A' }}>No Vacancies Found</h3>
          <p style={{ color: '#64748B', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            We could not find any active vacancies matching your search criteria. Try adjusting your filters or check back soon.
          </p>
          {(searchTerm || selectedType !== 'ALL' || selectedMode !== 'ALL' || selectedDept !== 'ALL' || selectedAvailability !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('ALL');
                setSelectedMode('ALL');
                setSelectedDept('ALL');
                setSelectedAvailability('ALL');
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
          {jobs.map((job) => {
            const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
            return (
              <div
                key={job.id}
                className="card card-hover"
                style={{
                  padding: 'clamp(1.25rem, 3.5vw, 2rem)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: isExpired ? '1px solid #FCA5A5' : '1px solid #E2E8F0',
                }}
              >
                <div style={{ flex: '1 1 280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-info">{job.department}</span>
                    <span className="badge badge-primary">{formatWorkMode(job.workMode)}</span>
                    <span className="badge badge-neutral">{job.jobCode}</span>
                    {isExpired ? (
                      <span className="badge badge-danger" style={{ background: '#FEE2E2', color: '#DC2626', borderColor: '#FCA5A5', fontWeight: 600 }}>
                        Deadline Passed
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ background: '#DCFCE7', color: '#16A34A', borderColor: '#86EFAC', fontWeight: 600 }}>
                        Active
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#0F172A', fontWeight: 700 }}>
                    {job.title}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      color: '#64748B',
                      fontSize: '0.875rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={15} color="#2563EB" />
                      <span>{job.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Briefcase size={15} color="#06B6D4" />
                      <span>{formatEmploymentType(job.employmentType)}</span>
                    </div>
                    {job.experienceRequired && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Layers size={15} color="#059669" />
                        <span>{job.experienceRequired}</span>
                      </div>
                    )}
                    {job.applicationDeadline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={15} color={isExpired ? '#DC2626' : '#D97706'} />
                        <span style={{ color: isExpired ? '#DC2626' : undefined, fontWeight: isExpired ? 600 : 400 }}>
                          {isExpired ? 'Deadline Passed: ' : 'Deadline: '}
                          {new Date(job.applicationDeadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.925rem', maxWidth: '780px', lineHeight: 1.6, margin: 0 }}>
                    {job.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link to={`/jobs/${job.id}`} className="btn btn-secondary">
                    <span>View Details</span>
                  </Link>
                  {isExpired ? (
                    <button
                      disabled
                      className="btn btn-secondary"
                      style={{ opacity: 0.65, cursor: 'not-allowed', background: '#F1F5F9', color: '#64748B', borderColor: '#CBD5E1' }}
                      title="The application deadline for this position has closed."
                    >
                      <span>Applications Closed</span>
                    </button>
                  ) : (
                    <Link to={`/jobs/${job.id}`} className="btn btn-primary">
                      <span>Apply Now</span>
                      <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {/* Prev / Next Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginTop: '2.5rem',
                padding: '1.25rem 1.75rem',
                background: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '0.9rem', color: '#64748B' }}>
                Showing page <strong style={{ color: '#0F172A' }}>{pagination.page}</strong> of{' '}
                <strong style={{ color: '#0F172A' }}>{pagination.totalPages}</strong> ({pagination.totalItems || jobs.length} total vacancies)
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  disabled={!pagination.hasPrevPage && pagination.page <= 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 320, behavior: 'smooth' });
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.55rem 1.15rem',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: (!pagination.hasPrevPage && pagination.page <= 1) ? 0.45 : 1,
                    cursor: (!pagination.hasPrevPage && pagination.page <= 1) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                    .map((pageNum, idx, arr) => {
                      const prev = arr[idx - 1];
                      return (
                        <React.Fragment key={pageNum}>
                          {prev && pageNum - prev > 1 && (
                            <span style={{ padding: '0.45rem 0.5rem', color: '#94A3B8' }}>...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 320, behavior: 'smooth' });
                            }}
                            className={`btn ${pagination.page === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                              padding: '0.45rem 0.85rem',
                              fontSize: '0.85rem',
                              minWidth: '38px',
                              fontWeight: pagination.page === pageNum ? 700 : 500,
                            }}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage && pagination.page >= pagination.totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(pagination.totalPages, p + 1));
                    window.scrollTo({ top: 320, behavior: 'smooth' });
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.55rem 1.15rem',
                    fontSize: '0.85rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: (!pagination.hasNextPage && pagination.page >= pagination.totalPages) ? 0.45 : 1,
                    cursor: (!pagination.hasNextPage && pagination.page >= pagination.totalPages) ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
