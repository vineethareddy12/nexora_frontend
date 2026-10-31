import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  CheckCircle2, 
  Send,
  AlertCircle,
  RefreshCw,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { jobsApi } from '../careers/api/jobsApi';
import JobApplicationWizardModal from '../../applicants/applications/JobApplicationWizardModal';

export default function JobDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationData, setApplicationData] = useState({
    noticePeriod: 'Immediate to 30 days',
    coverNote: '',
  });

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true);
        setError(null);
        const data = await jobsApi.getJobDetails(id);
        setJob(data);
      } catch (err) {
        console.error('Failed to load job details:', err);
        setError(err.message || 'Job vacancy not found or no longer active.');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadJob();
    }
  }, [id]);

  const isExpired = job?.applicationDeadline && new Date(job.applicationDeadline) < new Date();

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

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

  if (loading) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center', background: '#FFFFFF' }}>
        <RefreshCw className="spin" size={36} color="#2563EB" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#0F172A' }}>Loading Vacancy Details</h2>
        <p style={{ color: '#64748B' }}>Retrieving position requirements from Nexora database...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center', background: '#FFFFFF' }}>
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            borderColor: '#FECACA',
            background: '#FEF2F2',
          }}
        >
          <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', color: '#DC2626' }}>Vacancy Unavailable</h2>
          <p style={{ color: '#475569', marginBottom: '2rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
            {error || 'This vacancy may have been filled, closed, or unpublished.'}
          </p>
          <Link to="/careers" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Browse All Open Roles</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1rem, 3vw, 1.5rem)', background: '#FFFFFF' }}>
      <Link
        to="/careers"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#64748B',
          marginBottom: '2rem',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to all vacancies</span>
      </Link>

      <div
        className="card"
        style={{
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          marginBottom: '2.5rem',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {isExpired && (
          <div
            style={{
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#DC2626',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.95rem' }}>
              <strong>Application Period Closed:</strong> The deadline for this role was{' '}
              {new Date(job.applicationDeadline).toLocaleDateString()}. This position is no longer accepting new submissions.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-info">{job.department}</span>
          <span className="badge badge-primary">{formatWorkMode(job.workMode)}</span>
          {isExpired ? (
            <span className="badge badge-danger" style={{ background: '#FEE2E2', color: '#DC2626', borderColor: '#FCA5A5', fontWeight: 600 }}>
              Deadline Passed
            </span>
          ) : (
            <span className="badge badge-success">Open Vacancy</span>
          )}
          {job.salaryRange && (
            <span className="badge badge-neutral">{job.salaryRange}</span>
          )}
        </div>

        <h1 style={{ fontSize: 'clamp(1.65rem, 4vw, 2.25rem)', marginBottom: '1rem', color: '#0F172A', fontWeight: 800 }}>
          {job.title}
        </h1>

        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            color: '#64748B',
            fontSize: '0.9rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} color="#2563EB" />
            <span>{job.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Briefcase size={16} color="#06B6D4" />
            <span>{formatEmploymentType(job.employmentType)} {job.experienceRequired ? `• ${job.experienceRequired}` : ''}</span>
          </div>
          {job.applicationDeadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} color={isExpired ? '#DC2626' : '#D97706'} />
              <span style={{ color: isExpired ? '#DC2626' : undefined, fontWeight: isExpired ? 600 : 400 }}>
                {isExpired ? 'Deadline Passed: ' : 'Deadline: '}
                {new Date(job.applicationDeadline).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#0F172A' }}>Role Description</h3>
            <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '1rem' }}>
              {job.description}
            </p>
          </div>

          {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#0F172A' }}>Key Responsibilities</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0 }}>
                {job.responsibilities.map((res, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: '#475569', lineHeight: 1.6 }}>
                    <CheckCircle size={18} color="#2563EB" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#0F172A' }}>Required Skills & Expertise</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0 }}>
                {job.requiredSkills.map((skill, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: '#475569', lineHeight: 1.6 }}>
                    <CheckCircle size={18} color="#06B6D4" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(job.requiredQualifications) && job.requiredQualifications.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#0F172A' }}>Educational & Professional Qualifications</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0 }}>
                {job.requiredQualifications.map((qual, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', color: '#475569', lineHeight: 1.6 }}>
                    <CheckCircle size={18} color="#059669" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Application Action Bar - Auth Aware */}
        <div
          style={{
            marginTop: '2.5rem',
            paddingTop: '2rem',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Job Reference Code</div>
            <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#2563EB', fontSize: '1.05rem' }}>
              {job.jobCode}
            </div>
          </div>

          {/* Application Status Actions */}
          {isExpired ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                disabled
                className="btn btn-secondary"
                style={{
                  padding: '0.8rem 2rem',
                  fontSize: '0.95rem',
                  opacity: 0.65,
                  cursor: 'not-allowed',
                  background: '#F1F5F9',
                  color: '#64748B',
                  borderColor: '#CBD5E1',
                }}
              >
                <Clock size={16} />
                <span>Applications Closed</span>
              </button>
            </div>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--gradient-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                    Applying as {user.fullName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {submitted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 600, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={18} />
                  <span>Application Submitted!</span>
                  <Link to="/app/profile" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                    View Profile &rarr;
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowApplyModal(true)}
                  className="btn btn-primary"
                  style={{ padding: '0.8rem 2rem', fontSize: '0.95rem' }}
                >
                  <Send size={16} />
                  <span>Apply with My Profile</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Link to={`/login?redirect=/jobs/${job.id}`} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                <span>Sign In to Apply</span>
                <ArrowRight size={18} />
              </Link>
              <Link to={`/register?redirect=/jobs/${job.id}`} className="btn btn-outline" style={{ padding: '0.8rem 1.5rem' }}>
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 8-Step Complete Application Submission Wizard (Phase 2) */}
      <JobApplicationWizardModal
        job={job}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />
    </div>
  );
}
