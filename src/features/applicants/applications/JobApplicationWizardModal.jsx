import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  User,
  Award,
  CheckCircle2,
  ShieldCheck,
  Send,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  Clock,
  MapPin,
  Building,
  Upload,
  Check,
  ExternalLink,
  Loader2,
  Copy,
  Lock,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { applicationsApi } from './applicationsApi';
import { documentsApi } from '../documents/documentsApi';
import { profileApi } from '../profile/api/profileApi';
import { useAuth } from '../../auth/hooks/useAuth';
import { useToast } from '../../../components/toast/ToastContext';

const STEPS = [
  { id: 1, title: 'Job Eligibility', icon: Briefcase },
  { id: 2, title: 'Job Details', icon: FileText },
  { id: 3, title: 'Your Profile', icon: User },
  { id: 4, title: 'Select Resume', icon: FileText },
  { id: 5, title: 'Certificates', icon: Award },
  { id: 6, title: 'Review', icon: CheckCircle2 },
  { id: 7, title: 'Privacy Consent', icon: ShieldCheck },
  { id: 8, title: 'Confirmation', icon: Send },
];

const PRIVACY_NOTICE_VERSION = '1.2';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function JobApplicationWizardModal({ job, isOpen, onClose, onApplied }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState(null);

  // Profile data
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Documents data (Phase 1 vault)
  const [resumes, setResumes] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Form selections
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedCertIds, setSelectedCertIds] = useState([]);
  const [coverNote, setCoverNote] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('Immediate to 30 days');
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  // Quick upload in-wizard state
  const [isUploadingQuick, setIsUploadingQuick] = useState(false);
  const quickFileInputRef = useRef(null);

  // Submission result
  const [submittedApp, setSubmittedApp] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Load profile & documents on modal open
  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setCurrentStep(1);
      setStepError(null);
      setSubmittedApp(null);
      setPrivacyAcknowledged(false);
      return;
    }

    async function loadCandidateData() {
      try {
        setLoadingProfile(true);
        setLoadingDocs(true);

        const [profileData, docsData] = await Promise.all([
          profileApi.getProfile().catch(() => null),
          documentsApi.getDocuments().catch(() => []),
        ]);

        if (profileData) setProfile(profileData);

        const allDocs = Array.isArray(docsData) ? docsData : [];
        const userResumes = allDocs.filter((d) => d.type === 'RESUME');
        const userCerts = allDocs.filter((d) => d.type !== 'RESUME');

        setResumes(userResumes);
        setCertificates(userCerts);

        // Preselect the first resume if available
        if (userResumes.length > 0 && !selectedResumeId) {
          setSelectedResumeId(userResumes[0].id);
        }
      } catch (err) {
        console.error('Error loading candidate coordinates:', err);
      } finally {
        setLoadingProfile(false);
        setLoadingDocs(false);
      }
    }

    loadCandidateData();
  }, [isOpen]);

  if (!isOpen || !job) return null;

  // Validation helpers per step
  const validateCurrentStep = () => {
    setStepError(null);

    // Step 1: Check job publication & deadline
    if (currentStep === 1) {
      if (job.status !== 'PUBLISHED') {
        setStepError('This job is currently not accepting applications.');
        return false;
      }
      if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
        setStepError('The application deadline for this job posting has expired.');
        return false;
      }
    }

    // Step 3: Check profile contact number
    if (currentStep === 3) {
      if (!profile?.phone || profile.phone.trim() === '') {
        setStepError('A valid contact phone number is required on your profile before you can apply.');
        return false;
      }
    }

    // Step 4: Check resume selected
    if (currentStep === 4) {
      if (!selectedResumeId) {
        setStepError('Please select or upload a resume to continue.');
        return false;
      }
    }

    // Step 7: Check privacy consent
    if (currentStep === 7) {
      if (!privacyAcknowledged) {
        setStepError('You must explicitly acknowledge the Privacy Notice to submit your application.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStepError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Quick Resume Upload directly inside Step 4
  const handleQuickResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingQuick(true);
      setStepError(null);

      const uploadedDoc = await documentsApi.uploadDocument({
        file,
        type: 'RESUME',
        description: 'Uploaded via job application wizard',
      });

      setResumes((prev) => [uploadedDoc, ...prev]);
      setSelectedResumeId(uploadedDoc.id);
      toast.success('Resume uploaded successfully and selected for this application.', {
        title: 'Resume Added',
      });
    } catch (err) {
      console.error('Quick upload failed:', err);
      setStepError(err.message || 'Failed to upload resume. Please ensure it is a PDF, PNG, or JPEG under 5 MB.');
    } finally {
      setIsUploadingQuick(false);
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
    }
  };

  // Toggle certificate attachment
  const toggleCertificate = (certId) => {
    setSelectedCertIds((prev) =>
      prev.includes(certId) ? prev.filter((id) => id !== certId) : [...prev, certId]
    );
  };

  // Submit Application (Step 8 Execution)
  const handleSubmitApplication = async () => {
    if (!validateCurrentStep()) return;

    try {
      setSubmitting(true);
      setStepError(null);

      const payload = {
        resumeId: selectedResumeId,
        certificateIds: selectedCertIds,
        coverNote: coverNote.trim() || undefined,
        noticePeriod: noticePeriod.trim() || undefined,
        privacyAcknowledged: true,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      };

      const result = await applicationsApi.submitApplication(job.id, payload);

      setSubmittedApp(result);
      setCurrentStep(8); // Move to final confirmation screen

      toast.success(`Application logged under reference ${result.referenceNumber}!`, {
        title: 'Application Submitted',
      });

      if (onApplied) onApplied(result);
    } catch (err) {
      console.error('Submission failed:', err);
      setStepError(err.message || 'Unable to submit application. Please check requirements and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (!submittedApp?.referenceNumber) return;
    navigator.clipboard.writeText(submittedApp.referenceNumber);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const isExpired = job.applicationDeadline && new Date() > new Date(job.applicationDeadline);
  const selectedResumeObj = resumes.find((r) => r.id === selectedResumeId);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting && currentStep !== 8) onClose();
      }}
    >
      <div
        className="card"
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '780px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header with Title & Step Indicator */}
        <div
          style={{
            padding: '1.5rem 2rem 1.25rem',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                Application Wizard
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                Step {currentStep} of {STEPS.length}
              </span>
            </div>
            {currentStep !== 8 && (
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '6px',
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Stepper Dots Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {STEPS.map((step) => {
              const isPast = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    flex: 1,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isPast ? '#16A34A' : isCurrent ? '#2563EB' : '#FFFFFF',
                      color: isPast || isCurrent ? '#FFFFFF' : '#94A3B8',
                      border: isPast ? '1px solid #16A34A' : isCurrent ? '1px solid #2563EB' : '1px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      boxShadow: isCurrent ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                    }}
                  >
                    {isPast ? <Check size={16} /> : step.id}
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? '#0F172A' : '#64748B',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                    className="hide-mobile"
                  >
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {stepError && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: '#FEF2F2',
                border: '1px solid #FEE2E2',
                color: '#B91C1C',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <div>{stepError}</div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 1: SELECT JOB / CONFIRM VACANCY ELIGIBILITY
          ───────────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.65rem' }}>
                  Step 1 of 8
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Verify Role Eligibility
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.925rem', maxWidth: '520px', margin: '0 auto' }}>
                  Confirm this vacancy is currently active, accepting submissions, and aligned with your career aspirations.
                </p>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '1.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <span className="badge badge-neutral" style={{ marginBottom: '0.5rem', fontSize: '0.75rem' }}>
                      {job.jobCode}
                    </span>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {job.title}
                    </h3>
                  </div>
                  {job.status === 'PUBLISHED' && !isExpired ? (
                    <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                      <CheckCircle2 size={13} />
                      <span>Open for Applications</span>
                    </span>
                  ) : (
                    <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>
                      <AlertTriangle size={13} />
                      <span>Closed / Inactive</span>
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Department</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>{job.department}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Location</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>{job.location} ({job.workMode})</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Employment Type</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>{job.employmentType}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Application Deadline</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: isExpired ? '#DC2626' : '#0F172A' }}>
                      {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Open until filled'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 2: REVIEW JOB DESCRIPTION
          ───────────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  Step 2 of 8
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
                  Review Job Description & Responsibilities
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Ensure your technical competencies match the required scope of work before submitting.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Description */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                    Role Overview
                  </h4>
                  <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                    {job.description}
                  </p>
                </div>

                {/* Key Responsibilities */}
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                      Key Responsibilities
                    </h4>
                    <ul style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
                      {job.responsibilities.map((resp, i) => (
                        <li key={i} style={{ marginBottom: '0.35rem' }}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Required Skills */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                      Required Technical Competencies
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {job.requiredSkills.map((skill, i) => (
                        <span key={i} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 3: REVIEW APPLICANT PROFILE
          ───────────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  Step 3 of 8
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
                  Review Candidate Profile Coordinates
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  A permanent snapshot of these coordinates will be preserved with your submission.
                </p>
              </div>

              {loadingProfile ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 size={28} className="spin" style={{ margin: '0 auto', color: '#2563EB' }} />
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      background: '#F8FAFC',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      padding: '1.5rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '1.25rem',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Full Legal Name</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>{profile?.fullName || user?.fullName || '—'}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Primary Email</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>{profile?.email || user?.email || '—'}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Contact Phone *</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: profile?.phone ? '#0F172A' : '#DC2626' }}>
                        {profile?.phone || 'Missing phone number'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Current Location</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>{profile?.currentLocation || 'Not provided'}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Highest Qualification</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>{profile?.highestQualification || 'Not provided'}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>College / University</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>{profile?.collegeUniversity || 'Not provided'}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Total Experience</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>
                        {profile?.totalExperienceYears ? `${profile.totalExperienceYears} Years` : 'Fresher / Not specified'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Current / Previous Employer</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0F172A' }}>{profile?.currentOrPreviousEmployer || 'Not provided'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#EFF6FF', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontSize: '0.85rem', color: '#1E40AF' }}>
                      Need to update your contact coordinates or resume details?
                    </div>
                    <Link
                      to="/app/profile"
                      target="_blank"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        color: '#2563EB',
                        textDecoration: 'none',
                      }}
                    >
                      <span>Edit Profile in New Tab</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 4: SELECT OR UPLOAD RESUME
          ───────────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  Step 4 of 8
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
                  Select or Upload Your Resume (CV) *
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Choose from your existing Phase 1 vault resumes or upload a tailored version for this role.
                </p>
              </div>

              {loadingDocs ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 size={28} className="spin" style={{ margin: '0 auto', color: '#2563EB' }} />
                </div>
              ) : resumes.length === 0 ? (
                /* No resume uploaded yet: prompt direct upload */
                <div
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '16px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    background: '#F8FAFC',
                  }}
                >
                  <Upload size={36} color="#2563EB" style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                    No Resume in Vault
                  </h4>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                    Upload your latest CV in PDF, DOCX, PNG, or JPEG format (max 5 MB).
                  </p>
                  <button
                    type="button"
                    onClick={() => quickFileInputRef.current?.click()}
                    disabled={isUploadingQuick}
                    className="btn btn-primary"
                    style={{ padding: '0.7rem 1.5rem' }}
                  >
                    {isUploadingQuick ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                    <span>Upload Resume to Vault</span>
                  </button>
                  <input
                    type="file"
                    ref={quickFileInputRef}
                    onChange={handleQuickResumeUpload}
                    accept=".pdf,.png,.jpg,.jpeg,application/pdf"
                    style={{ display: 'none' }}
                  />
                </div>
              ) : (
                /* Resumes radio list */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {resumes.map((resume) => {
                    const isSelected = selectedResumeId === resume.id;
                    return (
                      <div
                        key={resume.id}
                        onClick={() => setSelectedResumeId(resume.id)}
                        style={{
                          padding: '1.15rem 1.25rem',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          background: isSelected ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              border: isSelected ? '6px solid #2563EB' : '2px solid #CBD5E1',
                              background: '#FFFFFF',
                              flexShrink: 0,
                            }}
                          />
                          <FileText size={22} color={isSelected ? '#2563EB' : '#64748B'} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.925rem', color: '#0F172A' }}>
                              {resume.originalFilename}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem' }}>
                              {formatBytes(resume.fileSizeBytes)} • Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })}

                  <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => quickFileInputRef.current?.click()}
                      disabled={isUploadingQuick}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      {isUploadingQuick ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                      <span>Upload Alternative Resume</span>
                    </button>
                    <input
                      type="file"
                      ref={quickFileInputRef}
                      onChange={handleQuickResumeUpload}
                      accept=".pdf,.png,.jpg,.jpeg,application/pdf"
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 5: ATTACH CERTIFICATES
          ───────────────────────────────────────────────────────────── */}
          {currentStep === 5 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  Step 5 of 8
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
                  Attach Supporting Certificates (Optional)
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Certificates are not universally mandatory. Select any educational degrees, internship credentials, or professional certifications to strengthen your application.
                </p>
              </div>

              {certificates.length === 0 ? (
                <div
                  style={{
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Award size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                    No Certificates in Vault
                  </h4>
                  <p style={{ color: '#64748B', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                    You have no certificates uploaded in your vault. You can proceed without certificates or upload credentials later.
                  </p>
                  <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                    Certificates are optional for this role
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {certificates.map((cert) => {
                    const isAttached = selectedCertIds.includes(cert.id);
                    return (
                      <div
                        key={cert.id}
                        onClick={() => toggleCertificate(cert.id)}
                        style={{
                          padding: '1.15rem 1.25rem',
                          borderRadius: '12px',
                          border: isAttached ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          background: isAttached ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '6px',
                              border: isAttached ? 'none' : '2px solid #CBD5E1',
                              background: isAttached ? '#2563EB' : '#FFFFFF',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {isAttached && <Check size={14} />}
                          </div>
                          <Award size={22} color={isAttached ? '#2563EB' : '#64748B'} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.925rem', color: '#0F172A' }}>
                              {cert.originalFilename}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem' }}>
                              {cert.type.replace('_', ' ')} • {formatBytes(cert.fileSizeBytes)}
                            </div>
                          </div>
                        </div>

                        {isAttached ? (
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            Attached
                          </span>
                        ) : (
                          <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                            Click to Attach
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 6: REVIEW APPLICATION SUMMARY
          ───────────────────────────────────────────────────────────── */}
          {currentStep === 6 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  Step 6 of 8
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
                  Final Application Review
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Review your submission parameters before giving explicit privacy consent.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Target Role Card */}
                <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Target Opening</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>{job.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.15rem' }}>
                    {job.department} • {job.location} ({job.workMode}) • Ref Code: {job.jobCode}
                  </div>
                </div>

                {/* Selected Resume */}
                <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Attached Resume (CV)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.35rem' }}>
                    <FileText size={18} color="#2563EB" />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0F172A' }}>
                      {selectedResumeObj?.originalFilename || 'No resume selected'}
                    </span>
                  </div>
                </div>

                {/* Attached Certificates */}
                <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Attached Certificates ({selectedCertIds.length})
                  </div>
                  {selectedCertIds.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.35rem' }}>
                      None selected (certificates are optional).
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {selectedCertIds.map((id) => {
                        const cert = certificates.find((c) => c.id === id);
                        return (
                          <span key={id} className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                            <Award size={12} />
                            <span>{cert?.originalFilename || 'Certificate'}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Candidate Notice Period */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}>
                    Notice Period / Availability *
                  </label>
                  <select
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      background: '#FFFFFF',
                    }}
                  >
                    <option value="Immediate to 15 days">Immediate to 15 days</option>
                    <option value="Immediate to 30 days">Immediate to 30 days</option>
                    <option value="45 days">45 days</option>
                    <option value="60 days">60 days</option>
                    <option value="90 days">90 days</option>
                  </select>
                </div>

                {/* Candidate Cover Note */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.4rem' }}>
                    Message to Hiring Manager (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Highlight your key achievements or why you are excited to join Nexora Technologies..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    maxLength={2000}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      background: '#FFFFFF',
                      resize: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 7: PRIVACY ACKNOWLEDGEMENT
          ───────────────────────────────────────────────────────────── */}
          {currentStep === 7 && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  Step 7 of 8
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
                  Recruitment Privacy Notice & Acknowledgement
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
                  Please review the terms of recruitment data processing before formal submission.
                </p>
              </div>

              {/* Privacy Notice Box */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '1.5rem',
                  fontSize: '0.85rem',
                  lineHeight: 1.7,
                  color: '#475569',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Nexora Technologies — Candidate Privacy Statement (v{PRIVACY_NOTICE_VERSION})
                </div>
                <p style={{ margin: '0 0 0.75rem' }}>
                  By applying for a vacancy at Nexora Technologies, you authorize our recruitment team and authorized evaluators to process your contact information, employment history, educational credentials, resume, and certificates strictly for evaluating your candidacy for this role and future relevant openings.
                </p>
                <p style={{ margin: '0 0 0.75rem' }}>
                  Your documents are stored privately in encrypted storage and will never be shared with unverified external third parties. You have the right to request access to or removal of your candidate record at any time in accordance with applicable data privacy regulations.
                </p>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Effective Date: October 19, 2026 • Policy Version: {PRIVACY_NOTICE_VERSION}
                </div>
              </div>

              {/* Consent Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: privacyAcknowledged ? '2px solid #2563EB' : '1px solid #CBD5E1',
                  background: privacyAcknowledged ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="checkbox"
                  checked={privacyAcknowledged}
                  onChange={(e) => setPrivacyAcknowledged(e.target.checked)}
                  style={{ width: '18px', height: '18px', marginTop: '0.2rem', accentColor: '#2563EB' }}
                />
                <div style={{ fontSize: '0.9rem', color: '#0F172A', lineHeight: 1.5, fontWeight: 500 }}>
                  I explicitly acknowledge and accept the <strong>Nexora Candidate Privacy Statement (v{PRIVACY_NOTICE_VERSION})</strong> and consent to the lawful processing and retention of my credentials for recruitment purposes.
                </div>
              </label>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 8: SUBMISSION CONFIRMATION
          ───────────────────────────────────────────────────────────── */}
          {currentStep === 8 && submittedApp && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <span className="badge badge-success" style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
                Application Committed
              </span>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                Application Submitted Successfully!
              </h2>

              <p style={{ color: '#475569', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                Your application for <strong>{submittedApp.jobTitle}</strong> has been logged into our enterprise recruitment queue.
              </p>

              {/* Reference Number Box */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  maxWidth: '460px',
                  margin: '0 auto 2rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                  Application Reference Number
                </div>
                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: '#2563EB',
                    letterSpacing: '0.05em',
                    margin: '0.5rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <span>{submittedApp.referenceNumber}</span>
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    title="Copy reference number"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: copiedRef ? '#16A34A' : '#64748B',
                      cursor: 'pointer',
                      padding: '0.25rem',
                    }}
                  >
                    {copiedRef ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Save this reference number to track recruitment updates and correspondence.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  to="/app/applications"
                  className="btn btn-primary"
                  onClick={onClose}
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                >
                  <span>View in My Applications</span>
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                >
                  Close Wizard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {currentStep !== 8 && (
          <div
            style={{
              padding: '1.25rem 2rem',
              borderTop: '1px solid #E2E8F0',
              background: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="btn btn-secondary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={submitting || !privacyAcknowledged}
                className="btn btn-primary"
                style={{
                  padding: '0.7rem 1.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Verifying & Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Confirm & Submit Application</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
