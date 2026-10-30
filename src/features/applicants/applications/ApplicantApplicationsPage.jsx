import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  Calendar,
  CheckCircle2,
  ChevronRight,
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

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Details Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Withdraw Modal
  const [withdrawTargetApp, setWithdrawTargetApp] = useState(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationsApi.getMyApplications();
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications:', err);
      toast.error(err.message || 'Unable to retrieve applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

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

  const filteredApps = applications.filter((app) => {
    if (statusFilter === 'ALL') return true;
    return app.status === statusFilter;
  });

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              My Job Applications
            </h1>
          </div>
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

      {/* 2. Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {[
          { key: 'ALL', label: `All (${applications.length})` },
          { key: 'SUBMITTED', label: 'Submitted' },
          { key: 'UNDER_REVIEW', label: 'Under Review' },
          { key: 'SHORTLISTED', label: 'Shortlisted' },
          { key: 'INTERVIEW_SCHEDULED', label: 'Interviewing' },
          { key: 'WITHDRAWN', label: 'Withdrawn' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: statusFilter === tab.key ? 600 : 500,
              background: statusFilter === tab.key ? '#2563EB' : '#FFFFFF',
              color: statusFilter === tab.key ? '#FFFFFF' : '#475569',
              border: statusFilter === tab.key ? '1px solid #2563EB' : '1px solid #E2E8F0',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Applications List Container */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#64748B' }}>
          <Loader2 size={32} className="spin" style={{ margin: '0 auto 1rem', color: '#2563EB' }} />
          <p style={{ fontSize: '0.95rem', margin: 0 }}>Loading your submitted applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
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
            {statusFilter === 'ALL' ? 'No Job Applications Submitted Yet' : `No Applications in status "${statusFilter}"`}
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            Browse our open engineering, cloud architecture, and AI engineering positions to launch your next career opportunity.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/careers" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
              <span>View Open Roles</span>
              <ArrowRight size={15} />
            </Link>
            <Link to="/app/documents" className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
              <span>Manage Resumes Vault</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Applications List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredApps.map((app) => {
            const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
            const canWithdraw = app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW';

            return (
              <div
                key={app.id}
                className="card"
                style={{
                  padding: 'clamp(1.25rem, 3.5vw, 2rem)',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Left: Job & Status Info */}
                <div style={{ flex: '1 1 400px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#2563EB',
                        background: '#EFF6FF',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #DBEAFE',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {app.referenceNumber}
                    </span>
                    <span className={`badge ${statusConfig.badgeClass}`} style={{ fontSize: '0.75rem' }}>
                      {statusConfig.label}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Submitted {formatDate(app.submittedAt)}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                    {app.job?.title || 'Job Opening'}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#64748B', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building size={15} color="#94A3B8" />
                      <span>{app.job?.department || 'Engineering'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={15} color="#94A3B8" />
                      <span>{app.job?.location || 'Remote'} ({app.job?.workMode || 'Hybrid'})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileText size={15} color="#94A3B8" />
                      <span>{app.documents?.length || 1} Document(s) Preserved</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', alignSelf: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => openDetailsModal(app)}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.6rem 1.1rem',
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Eye size={16} />
                    <span>View Details</span>
                  </button>

                  {canWithdraw && (
                    <button
                      type="button"
                      onClick={() => setWithdrawTargetApp(app)}
                      style={{
                        padding: '0.6rem 1rem',
                        fontSize: '0.85rem',
                        background: '#FFFFFF',
                        border: '1px solid #FEE2E2',
                        color: '#EF4444',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. APPLICATION DETAILS MODAL (WITH FROZEN DOCUMENT SNAPSHOTS)
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
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={18} color={doc.isResume ? '#2563EB' : '#16A34A'} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>
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
          5. WITHDRAW CONFIRMATION MODAL
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

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
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
