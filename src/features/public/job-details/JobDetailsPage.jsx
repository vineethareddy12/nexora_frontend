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

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // In Phase 3, job application workflows are strictly excluded per SRS rules.
    // An Apply Now link may navigate to the existing application entry point.
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
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={36} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Loading Vacancy Details</h2>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving position requirements from Nexora database...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', borderColor: 'var(--status-danger)' }}>
          <AlertCircle size={44} color="var(--status-danger)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>Vacancy Unavailable</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
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
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <Link to="/careers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} />
        <span>Back to all vacancies</span>
      </Link>

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-info">{job.department}</span>
          <span className="badge badge-primary">{formatWorkMode(job.workMode)}</span>
          <span className="badge badge-success">Open Vacancy</span>
          {job.salaryRange && (
            <span className="badge badge-secondary">{job.salaryRange}</span>
          )}
        </div>

        <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{job.title}</h1>

        <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} />
            <span>{job.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Briefcase size={16} />
            <span>{formatEmploymentType(job.employmentType)} {job.experienceRequired ? `• ${job.experienceRequired}` : ''}</span>
          </div>
          {job.applicationDeadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} />
              <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Role Description</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
              {job.description}
            </p>
          </div>

          {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Key Responsibilities</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
                {job.responsibilities.map((res, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <CheckCircle size={16} color="var(--primary)" style={{ marginTop: '0.25rem', flexShrink: 0 }} />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Required Skills & Expertise</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
                {job.requiredSkills.map((skill, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <CheckCircle size={16} color="var(--accent)" style={{ marginTop: '0.25rem', flexShrink: 0 }} />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(job.requiredQualifications) && job.requiredQualifications.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Educational & Professional Qualifications</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
                {job.requiredQualifications.map((qual, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    <CheckCircle size={16} color="var(--status-success)" style={{ marginTop: '0.25rem', flexShrink: 0 }} />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Application Action Bar - Auth Aware */}
        <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Job Reference Code</div>
            <div style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent)', fontSize: '1.05rem' }}>{job.jobCode}</div>
          </div>

          {/* Already Logged In Check */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Applying as {user.fullName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {submitted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', fontWeight: 600, fontSize: '0.9rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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

      {/* Application Submission Modal */}
      {showApplyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '2rem',
              background: 'var(--bg-secondary)',
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            {!submitted ? (
              <form onSubmit={handleApplySubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Application Submission</span>
                  <h2 style={{ fontSize: '1.45rem', marginBottom: '0.35rem' }}>{job.title}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Confirm your details to submit your profile directly to the Nexora recruitment team.
                  </p>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>Candidate Coordinates</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user?.fullName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.35rem' }}>
                    • Your registered resume and technical credentials will be attached automatically.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Notice Period / Availability
                    </label>
                    <select
                      value={applicationData.noticePeriod}
                      onChange={(e) => setApplicationData({ ...applicationData, noticePeriod: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    >
                      <option value="Immediate to 15 days">Immediate to 15 days</option>
                      <option value="Immediate to 30 days">Immediate to 30 days</option>
                      <option value="60 days">60 days</option>
                      <option value="90 days">90 days</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Note to Hiring Manager (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Briefly highlight why you're a great fit for this engineering role..."
                      value={applicationData.coverNote}
                      onChange={(e) => setApplicationData({ ...applicationData, coverNote: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ minWidth: '160px' }}
                  >
                    {submitting ? 'Submitting...' : 'Confirm & Apply'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Application Submitted!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                  Your application for <strong>{job.title}</strong> has been logged under reference <strong>{job.jobCode}</strong>.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <Link to="/app/profile" className="btn btn-primary" onClick={() => setShowApplyModal(false)}>
                    View Candidate Profile &rarr;
                  </Link>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
